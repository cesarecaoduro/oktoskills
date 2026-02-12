"use client";

import type { NodeProps } from "@xyflow/react";
import type { AgentNode, ModelNodeData } from "@/lib/flow/types";

import { memo, useEffect } from "react";
import {
  Node,
  NodeAction,
  NodeContent,
  NodeHeader,
  NodeTitle,
} from "@/components/ai-elements/node";
import { Button } from "@/components/ui/button";
import { NODE_COLORS } from "@/lib/flow/node-colors";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Bot, Check, Cog, FileText, Layers, Trash2 } from "lucide-react";
import { useFlowEditorStore } from "@/lib/flow/store";

function AgentNodeComponentInner({
  id,
  data,
  selected,
}: NodeProps<AgentNode>) {
  const { deleteElements, getEdges, getNodes, setNodes } = useReactFlow();
  const { getModelById } = useFlowEditorStore();

  const edges = getEdges();
  const nodes = getNodes();
  const incomingEdges = edges.filter((e) => e.target === id);

  const connectedNodes = incomingEdges
    .map((e) => {
      const node = nodes.find((n) => n.id === e.source);
      return node ? { node, targetHandle: e.targetHandle } : null;
    })
    .filter(Boolean);

  const modelConnection = connectedNodes.find(
    (c) => c!.targetHandle === "model" || (!c!.targetHandle && c!.node.type === "model")
  );
  const promptConnection = connectedNodes.find(
    (c) => c!.targetHandle === "prompt" || (!c!.targetHandle && c!.node.type === "textInput")
  );
  const contextConnections = connectedNodes.filter(
    (c) =>
      c!.targetHandle === "context" ||
      (!c!.targetHandle &&
        (c!.node.type === "document" ||
          (c!.node.type === "textInput" && c!.node.id !== promptConnection?.node.id)))
  );

  const modelNode = modelConnection?.node;
  const promptNode = promptConnection?.node;

  const connectedModel = modelNode
    ? getModelById((modelNode.data as ModelNodeData).modelId)
    : null;

  useEffect(() => {
    const contextNodeIds = incomingEdges.map((e) => e.source);
    const currentIds = (data.contextNodes || []).sort().join(",");
    const newIds = contextNodeIds.sort().join(",");

    if (currentIds !== newIds) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, contextNodes: contextNodeIds } }
            : node
        )
      );
    }
  }, [id, incomingEdges, data.contextNodes, setNodes]);

  return (
    <Node
      handles={{ target: false, source: true }}
      selected={selected}
      accentColor={NODE_COLORS.agent.accent}
    >
      {/* 3 input handles aligned to content rows */}
      <Handle type="target" position={Position.Left} id="model" style={{ top: "47%" }} />
      <Handle type="target" position={Position.Left} id="prompt" style={{ top: "64%" }} />
      <Handle type="target" position={Position.Left} id="context" style={{ top: "82%" }} />

      <NodeHeader className="p-3">
        <NodeTitle className="flex items-center gap-1.5 text-sm font-semibold leading-none">
          <Bot className="size-3.5" style={{ color: NODE_COLORS.agent.accent }} />
          {data.label}
        </NodeTitle>
        <NodeAction className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => deleteElements({ nodes: [{ id }] })}
          >
            <Trash2 className="size-3" />
          </Button>
        </NodeAction>
      </NodeHeader>

      <NodeContent className="p-3 space-y-0">
        {/* Model row */}
        <div className="flex items-center gap-2 py-1.5 text-xs">
          <Cog className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Model</span>
          <span className="ml-auto truncate font-medium">
            {connectedModel ? connectedModel.name : (
              <span className="text-muted-foreground font-normal">Not set</span>
            )}
          </span>
        </div>

        {/* Prompt row */}
        <div className="flex items-center gap-2 py-1.5 text-xs">
          <FileText className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Prompt</span>
          {promptNode && <Check className="ml-auto size-3.5 text-emerald-500" />}
        </div>

        {/* Context row */}
        <div className="flex items-center gap-2 py-1.5 text-xs">
          <Layers className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Context</span>
          {contextConnections.length > 0 && (
            <Check className="ml-auto size-3.5 text-emerald-500" />
          )}
        </div>
      </NodeContent>
    </Node>
  );
}

export const AgentNodeComponent = memo(AgentNodeComponentInner);
