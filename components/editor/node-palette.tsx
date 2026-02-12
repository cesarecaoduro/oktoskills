"use client";

import type { AppNode } from "@/lib/flow/types";
import { NODE_COLORS, type NodeColorKey } from "@/lib/flow/node-colors";
import { paletteItems, defaultNodeData } from "@/lib/flow/node-defaults";

import { Panel } from "@/components/ai-elements/panel";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useReactFlow } from "@xyflow/react";
import { nanoid } from "nanoid";

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

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/octoskills-node", nodeType);
    event.dataTransfer.effectAllowed = "move";
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
                draggable
                onDragStart={(e) => onDragStart(e, item.type)}
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
