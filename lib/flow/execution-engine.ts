import type { AppEdge, AppNode, ModelNodeData, TextInputNodeData, LLMNodeData, TextOutputNodeData, DocumentNodeData } from "./types";
import type { ExecutionRun, NodeExecutionLog, LLMExecuteRequest, LLMExecuteResponse } from "./execution-types";
import { nanoid } from "nanoid";

export function topologicalSort(nodes: AppNode[], edges: AppEdge[]): AppNode[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    const targets = adjacency.get(edge.source);
    if (targets) targets.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== nodes.length) {
    throw new Error("Cycle detected in the flow graph");
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sorted.map((id) => nodeMap.get(id)!);
}

function findConnectedNode(
  nodeId: string,
  handleId: string | undefined,
  fallbackType: string,
  edges: AppEdge[],
  nodeMap: Map<string, AppNode>,
): AppNode | undefined {
  const incoming = edges.filter((e) => e.target === nodeId);
  for (const edge of incoming) {
    if (handleId && edge.targetHandle === handleId) {
      return nodeMap.get(edge.source);
    }
  }
  // Fallback: match by type
  for (const edge of incoming) {
    const source = nodeMap.get(edge.source);
    if (source?.type === fallbackType) return source;
  }
  return undefined;
}

function findUpstreamOutput(
  nodeId: string,
  edges: AppEdge[],
  outputs: Map<string, string>,
): string | undefined {
  const incoming = edges.filter((e) => e.target === nodeId);
  for (const edge of incoming) {
    const val = outputs.get(edge.source);
    if (val !== undefined) return val;
  }
  return undefined;
}

export async function executeFlow(
  nodes: AppNode[],
  edges: AppEdge[],
  onLogUpdate: (logs: NodeExecutionLog[]) => void,
  modelPricing?: Map<string, { input: string; output: string }>,
): Promise<ExecutionRun> {
  const runId = nanoid();
  const startedAt = Date.now();
  const logs: NodeExecutionLog[] = [];
  const outputs = new Map<string, string>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  let sorted: AppNode[];
  try {
    sorted = topologicalSort(nodes, edges);
  } catch (error) {
    return {
      id: runId,
      status: "error",
      startedAt,
      completedAt: Date.now(),
      totalDurationMs: Date.now() - startedAt,
      logs: [{
        nodeId: "graph",
        nodeType: "system",
        nodeLabel: "Graph Validation",
        status: "error",
        startedAt,
        completedAt: Date.now(),
        durationMs: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      }],
      totalCostUSD: 0,
    };
  }

  let totalCost = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const modelsUsed = new Set<string>();

  for (const node of sorted) {
    const log: NodeExecutionLog = {
      nodeId: node.id,
      nodeType: node.type!,
      nodeLabel: (node.data as { label: string }).label,
      status: "running",
      startedAt: Date.now(),
    };
    logs.push(log);
    onLogUpdate([...logs]);

    try {
      switch (node.type) {
        case "textInput": {
          const text = (node.data as TextInputNodeData).text || "";
          outputs.set(node.id, text);
          log.output = text;
          break;
        }

        case "document": {
          const content = (node.data as DocumentNodeData).content || "";
          outputs.set(node.id, content);
          log.output = content;
          break;
        }

        case "model": {
          // Model nodes provide config only - no execution
          outputs.set(node.id, (node.data as ModelNodeData).modelId);
          log.output = `Model: ${(node.data as ModelNodeData).modelId}`;
          break;
        }

        case "llm": {
          const llmData = node.data as LLMNodeData;

          // Resolve model: connected Model node, then own modelId
          const modelNode = findConnectedNode(node.id, "llm-model", "model", edges, nodeMap);
          const modelId = modelNode
            ? (modelNode.data as ModelNodeData).modelId
            : llmData.modelId;

          if (!modelId) {
            throw new Error("No model connected or configured");
          }

          // Resolve prompt: connected TextInput node output
          const promptNode = findConnectedNode(node.id, "llm-prompt", "textInput", edges, nodeMap);
          const userPrompt = promptNode
            ? outputs.get(promptNode.id) ?? ""
            : "";

          if (!userPrompt) {
            throw new Error("No prompt connected or prompt is empty");
          }

          const request: LLMExecuteRequest = {
            modelId,
            systemPrompt: llmData.systemPrompt || undefined,
            userPrompt,
            temperature: llmData.temperature ?? 0.7,
            maxTokens: llmData.maxTokens ?? 1024,
          };

          const response = await fetch("/api/flow/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
          });

          const result = (await response.json()) as LLMExecuteResponse & { error?: string };

          if (!response.ok || result.error) {
            throw new Error(result.error || `API error: ${response.status}`);
          }

          outputs.set(node.id, result.text);
          log.output = result.text;
          log.usage = result.usage;
          log.modelId = modelId;

          // Accumulate tokens and cost
          modelsUsed.add(modelId);
          if (result.usage) {
            totalInputTokens += result.usage.inputTokens ?? 0;
            totalOutputTokens += result.usage.outputTokens ?? 0;

            const pricing = modelPricing?.get(modelId);
            if (pricing) {
              const cost =
                (result.usage.inputTokens ?? 0) * parseFloat(pricing.input) +
                (result.usage.outputTokens ?? 0) * parseFloat(pricing.output);
              log.costUSD = cost;
              totalCost += cost;
            }
          }
          break;
        }

        case "textOutput": {
          const upstream = findUpstreamOutput(node.id, edges, outputs);
          if (upstream !== undefined) {
            outputs.set(node.id, upstream);
            log.output = upstream;
          }
          break;
        }

        case "agent": {
          // Agent execution not implemented yet
          log.output = "Agent execution not yet supported";
          break;
        }

        case "condition": {
          log.output = "Condition evaluation not yet supported";
          break;
        }

        case "tool": {
          log.output = "Tool execution not yet supported";
          break;
        }
      }

      log.status = "completed";
    } catch (error) {
      log.status = "error";
      log.error = error instanceof Error ? error.message : "Unknown error";
    }

    log.completedAt = Date.now();
    log.durationMs = log.completedAt - log.startedAt;
    onLogUpdate([...logs]);
  }

  return {
    id: runId,
    status: logs.some((l) => l.status === "error") ? "error" : "completed",
    startedAt,
    completedAt: Date.now(),
    totalDurationMs: Date.now() - startedAt,
    logs,
    totalCostUSD: totalCost,
    totalInputTokens,
    totalOutputTokens,
    models: Array.from(modelsUsed),
  };
}

// --- Graph traversal helpers ---

function getUpstreamIds(nodeId: string, edges: AppEdge[]): Set<string> {
  const visited = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of edges) {
      if (edge.target === current && !visited.has(edge.source)) {
        visited.add(edge.source);
        queue.push(edge.source);
      }
    }
  }
  return visited;
}

function getDownstreamIds(nodeId: string, edges: AppEdge[]): Set<string> {
  const visited = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of edges) {
      if (edge.source === current && !visited.has(edge.target)) {
        visited.add(edge.target);
        queue.push(edge.target);
      }
    }
  }
  return visited;
}

export async function executeFromNode(
  startNodeId: string,
  nodes: AppNode[],
  edges: AppEdge[],
  onLogUpdate: (logs: NodeExecutionLog[]) => void,
  modelPricing?: Map<string, { input: string; output: string }>,
): Promise<ExecutionRun> {
  const upstreamIds = getUpstreamIds(startNodeId, edges);
  const downstreamIds = getDownstreamIds(startNodeId, edges);
  const subgraphIds = new Set([...upstreamIds, startNodeId, ...downstreamIds]);

  const subNodes = nodes.filter((n) => subgraphIds.has(n.id));
  const subEdges = edges.filter(
    (e) => subgraphIds.has(e.source) && subgraphIds.has(e.target),
  );

  return executeFlow(subNodes, subEdges, onLogUpdate, modelPricing);
}
