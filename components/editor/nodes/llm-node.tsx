"use client";

import type { NodeProps } from "@xyflow/react";
import type { LLMNode, ModelNodeData } from "@/lib/flow/types";

import { memo } from "react";
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
import { Check, Cog, FileText, Sparkles, Thermometer, Trash2 } from "lucide-react";
import { useFlowEditorStore } from "@/lib/flow/store";

function LLMNodeComponentInner({
  id,
  data,
  selected,
}: NodeProps<LLMNode>) {
  const { deleteElements, getEdges, getNodes } = useReactFlow();
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
    (c) => c!.targetHandle === "llm-model" || (!c!.targetHandle && c!.node.type === "model")
  );
  const promptConnection = connectedNodes.find(
    (c) => c!.targetHandle === "llm-prompt" || (!c!.targetHandle && c!.node.type === "textInput")
  );

  const modelNode = modelConnection?.node;
  const promptNode = promptConnection?.node;

  // Resolve model: connected Model node first, then own modelId
  const modelData = modelNode?.data as ModelNodeData | undefined;
  const resolvedModelId = modelData?.modelId || data.modelId;
  const connectedModel = resolvedModelId ? getModelById(resolvedModelId) : null;
  const resolvedTemp = modelData?.temperature ?? data.temperature;
  const resolvedMaxTokens = modelData?.maxTokens ?? data.maxTokens;

  return (
    <Node
      handles={{ target: false, source: true }}
      selected={selected}
      accentColor={NODE_COLORS.llm.accent}
    >
      <Handle type="target" position={Position.Left} id="llm-model" style={{ top: "42%" }} />
      <Handle type="target" position={Position.Left} id="llm-prompt" style={{ top: "72%" }} />

      <NodeHeader className="p-3">
        <NodeTitle className="flex items-center gap-1.5 text-sm font-semibold leading-none">
          <Sparkles className="size-3.5" style={{ color: NODE_COLORS.llm.accent }} />
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

        {/* Temperature + MaxTokens row */}
        {(resolvedTemp !== undefined || resolvedMaxTokens !== undefined) && (
          <div className="flex items-center gap-3 py-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1 tabular-nums">
              <Thermometer className="size-3" />
              {resolvedTemp}
            </span>
            <span className="tabular-nums">
              {resolvedMaxTokens} tok
            </span>
          </div>
        )}

        {/* Prompt row */}
        <div className="flex items-center gap-2 py-1.5 text-xs">
          <FileText className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Prompt</span>
          {promptNode && <Check className="ml-auto size-3.5 text-emerald-500" />}
        </div>
      </NodeContent>
    </Node>
  );
}

export const LLMNodeComponent = memo(LLMNodeComponentInner);
