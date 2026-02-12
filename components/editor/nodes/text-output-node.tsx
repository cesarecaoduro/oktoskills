"use client";

import type { NodeProps } from "@xyflow/react";
import type { TextOutputNode } from "@/lib/flow/types";

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
import { FileDown, Send, Trash2 } from "lucide-react";

function TextOutputNodeComponentInner({
  id,
  data,
  selected,
}: NodeProps<TextOutputNode>) {
  const { deleteElements } = useReactFlow();

  return (
    <Node
      handles={{ target: true, source: false }}
      selected={selected}
      accentColor={NODE_COLORS.textOutput.accent}
    >
      <NodeHeader className="p-3">
        <NodeTitle className="flex items-center gap-1.5 text-sm font-semibold leading-none">
          <Send className="size-3.5" style={{ color: NODE_COLORS.textOutput.accent }} />
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
        {/* Format row */}
        <div className="flex items-center gap-2 text-xs">
          <FileDown className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Format</span>
          <span className="ml-auto font-medium capitalize">
            {data.outputFormat || "markdown"}
          </span>
        </div>

        {/* Format-aware output preview */}
        {data.outputFormat === "json" ? (
          <div className="min-h-16 overflow-auto rounded-md border bg-muted/50 p-2.5 font-mono text-[11px] text-muted-foreground whitespace-pre">
            {data.text || "{ }"}
          </div>
        ) : data.outputFormat === "file" ? (
          <div className="flex min-h-16 items-center gap-2 rounded-md border bg-muted/50 p-2.5 text-xs text-muted-foreground">
            <FileDown className="size-4 shrink-0" />
            <span>{data.text ? "File ready" : "No file output yet"}</span>
          </div>
        ) : (
          <div className="min-h-16 rounded-md border bg-muted/50 p-2.5 text-xs text-muted-foreground">
            {data.text || "Output will appear here..."}
          </div>
        )}
      </NodeContent>
    </Node>
  );
}

export const TextOutputNodeComponent = memo(TextOutputNodeComponentInner);
