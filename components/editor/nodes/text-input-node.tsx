"use client";

import type { NodeProps } from "@xyflow/react";
import type { TextInputNode } from "@/lib/flow/types";

import { memo } from "react";
import {
  Node,
  NodeAction,
  NodeContent,
  NodeHeader,
  NodeTitle,
} from "@/components/ai-elements/node";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NODE_COLORS } from "@/lib/flow/node-colors";
import { useReactFlow } from "@xyflow/react";
import { Trash2, Type } from "lucide-react";

function TextInputNodeComponentInner({
  id,
  data,
  selected,
}: NodeProps<TextInputNode>) {
  const { updateNodeData, deleteElements } = useReactFlow();

  return (
    <Node
      handles={{ target: false, source: true }}
      selected={selected}
      accentColor={NODE_COLORS.textInput.accent}
    >
      <NodeHeader className="p-3">
        <NodeTitle className="flex items-center gap-1.5 text-sm font-semibold leading-none">
          <Type className="size-3.5" style={{ color: NODE_COLORS.textInput.accent }} />
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
      <NodeContent className="p-3">
        <Textarea
          className="nodrag nowheel min-h-16 resize-none text-xs"
          placeholder="Enter text..."
          value={data.text}
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
        />
      </NodeContent>
    </Node>
  );
}

export const TextInputNodeComponent = memo(TextInputNodeComponentInner);
