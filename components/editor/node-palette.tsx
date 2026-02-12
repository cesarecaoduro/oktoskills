"use client";

import type { AppNode } from "@/lib/flow/types";
import { NODE_COLORS, type NodeColorKey } from "@/lib/flow/node-colors";

import { Panel } from "@/components/ai-elements/panel";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useReactFlow } from "@xyflow/react";
import {
  Bot,
  Brain,
  FileOutput,
  FileText,
  Type,
} from "lucide-react";
import { nanoid } from "nanoid";

const paletteItems = [
  { type: "textInput", label: "Text", icon: Type },
  { type: "document", label: "Document", icon: FileText },
  { type: "model", label: "Model", icon: Brain },
  { type: "agent", label: "Agent", icon: Bot },
  { type: "textOutput", label: "Output", icon: FileOutput },
] as const;

const defaultNodeData: Record<string, Record<string, unknown>> = {
  textInput: { label: "Text Input", text: "" },
  textOutput: { label: "Text Output", text: "" },
  model: { label: "Model", modelId: "", temperature: 0.7, maxTokens: 1024 },
  document: { label: "Document", content: "", files: [] },
  agent: {
    label: "Agent",
    webSearchEnabled: false,
    contextNodes: [],
  },
};

export function NodePalette() {
  const { addNodes, screenToFlowPosition } = useReactFlow();

  const addNode = (type: string) => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    addNodes({
      id: nanoid(),
      type: type as AppNode["type"],
      position,
      data: { ...defaultNodeData[type] } as AppNode["data"],
    });
  };

  return (
    <Panel position="bottom-center" className="flex items-center gap-2 p-2">
      <TooltipProvider>
        {paletteItems.map((item) => (
          <Tooltip key={item.type}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode(item.type)}
              >
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: NODE_COLORS[item.type as NodeColorKey]?.accent }}
                />
                <item.icon className="size-5" />
                {item.label}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add {item.label} node</TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </Panel>
  );
}
