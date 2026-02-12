"use client";

import type { NodeProps } from "@xyflow/react";
import type { ToolNode } from "@/lib/flow/types";

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
import { useReactFlow } from "@xyflow/react";
import { Trash2, Wrench } from "lucide-react";

const toolTypeLabels: Record<string, string> = {
  "api-call": "API Call",
  function: "Function",
  "database-query": "Database Query",
  "web-search": "Web Search",
};

function ToolNodeComponentInner({
  id,
  data,
  selected,
}: NodeProps<ToolNode>) {
  const { deleteElements } = useReactFlow();

  return (
    <Node
      handles={{ target: true, source: true }}
      selected={selected}
      accentColor={NODE_COLORS.tool.accent}
    >
      <NodeHeader className="p-3">
        <NodeTitle className="flex items-center gap-1.5 text-sm font-semibold leading-none">
          <Wrench className="size-3.5" style={{ color: NODE_COLORS.tool.accent }} />
          {data.label}
        </NodeTitle>
        <NodeAction className="flex gap-1">
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: `color-mix(in oklch, ${NODE_COLORS.tool.accent} 15%, transparent)`,
              color: NODE_COLORS.tool.accent,
            }}
          >
            TOOL
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
          <Wrench className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Type</span>
          <span className="ml-auto font-medium">
            {toolTypeLabels[data.toolType] ?? data.toolType}
          </span>
        </div>
      </NodeContent>
    </Node>
  );
}

export const ToolNodeComponent = memo(ToolNodeComponentInner);
