"use client";

import type { NodeProps } from "@xyflow/react";
import type { ConditionNode } from "@/lib/flow/types";

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
import { GitBranch, Trash2 } from "lucide-react";

const conditionTypeLabels: Record<string, string> = {
  "if-else": "If / Else",
  switch: "Switch",
  loop: "Loop",
};

function ConditionNodeComponentInner({
  id,
  data,
  selected,
}: NodeProps<ConditionNode>) {
  const { deleteElements } = useReactFlow();

  const sourceHandles = (() => {
    switch (data.conditionType) {
      case "if-else":
        return [
          { id: "condition-true", label: "True", top: "40%" },
          { id: "condition-false", label: "False", top: "70%" },
        ];
      case "switch":
        return [
          { id: "condition-case-1", label: "Case 1", top: "30%" },
          { id: "condition-case-2", label: "Case 2", top: "55%" },
          { id: "condition-default", label: "Default", top: "80%" },
        ];
      case "loop":
        return [
          { id: "condition-body", label: "Body", top: "40%" },
          { id: "condition-done", label: "Done", top: "70%" },
        ];
      default:
        return [
          { id: "condition-true", label: "True", top: "40%" },
          { id: "condition-false", label: "False", top: "70%" },
        ];
    }
  })();

  return (
    <Node
      handles={{ target: true, source: false }}
      selected={selected}
      accentColor={NODE_COLORS.condition.accent}
    >
      {sourceHandles.map((h) => (
        <Handle
          key={h.id}
          type="source"
          position={Position.Right}
          id={h.id}
          style={{ top: h.top }}
        />
      ))}

      <NodeHeader className="p-3">
        <NodeTitle className="flex items-center gap-1.5 text-sm font-semibold leading-none">
          <GitBranch className="size-3.5" style={{ color: NODE_COLORS.condition.accent }} />
          {data.label}
        </NodeTitle>
        <NodeAction className="flex gap-1">
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: `color-mix(in oklch, ${NODE_COLORS.condition.accent} 15%, transparent)`,
              color: NODE_COLORS.condition.accent,
            }}
          >
            CONDITION
          </span>
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
        {data.description && (
          <p className="text-xs text-muted-foreground pb-1.5 line-clamp-2">
            {data.description}
          </p>
        )}

        <div className="flex items-center gap-2 py-1.5 text-xs">
          <GitBranch className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Type</span>
          <span className="ml-auto font-medium">
            {conditionTypeLabels[data.conditionType] ?? data.conditionType}
          </span>
        </div>

        {/* Handle labels */}
        <div className="flex flex-col gap-0.5 pt-1">
          {sourceHandles.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: NODE_COLORS.condition.accent }}
              />
              {h.label}
            </div>
          ))}
        </div>
      </NodeContent>
    </Node>
  );
}

export const ConditionNodeComponent = memo(ConditionNodeComponentInner);
