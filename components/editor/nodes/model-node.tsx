"use client";

import type { NodeProps } from "@xyflow/react";
import type { ModelNode } from "@/lib/flow/types";

import { memo } from "react";
import {
  Node,
  NodeAction,
  NodeContent,
  NodeHeader,
  NodeTitle,
} from "@/components/ai-elements/node";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NODE_COLORS } from "@/lib/flow/node-colors";
import { useReactFlow } from "@xyflow/react";
import { Brain, Trash2 } from "lucide-react";
import { ModelSelectorDialog } from "@/components/editor/model-selector-dialog";

function ModelNodeComponentInner({
  id,
  data,
  selected,
}: NodeProps<ModelNode>) {
  const { deleteElements, updateNodeData } = useReactFlow();

  return (
    <Node
      handles={{ target: true, source: true }}
      selected={selected}
      accentColor={NODE_COLORS.model.accent}
    >
      <NodeHeader className="p-3">
        <NodeTitle className="flex items-center gap-1.5 text-sm font-semibold leading-none">
          <Brain className="size-3.5" style={{ color: NODE_COLORS.model.accent }} />
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
      <NodeContent className="p-3 space-y-2">
        <div className="nodrag nowheel">
          <ModelSelectorDialog
            value={data.modelId || ""}
            onSelect={(modelId) => updateNodeData(id, { modelId })}
          />
        </div>

        {data.temperature !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Temperature</span>
            <Badge variant="secondary" className="text-[10px] font-medium tabular-nums">
              {data.temperature}
            </Badge>
          </div>
        )}
        {data.maxTokens && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Max Tokens</span>
            <Badge variant="secondary" className="text-[10px] font-medium tabular-nums">
              {data.maxTokens}
            </Badge>
          </div>
        )}
      </NodeContent>
    </Node>
  );
}

export const ModelNodeComponent = memo(ModelNodeComponentInner);
