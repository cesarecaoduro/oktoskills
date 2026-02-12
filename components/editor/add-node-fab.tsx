"use client";

import type { AppNode } from "@/lib/flow/types";
import { NODE_COLORS, type NodeColorKey } from "@/lib/flow/node-colors";
import { paletteItems, defaultNodeData } from "@/lib/flow/node-defaults";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useReactFlow } from "@xyflow/react";
import { nanoid } from "nanoid";
import { Plus } from "lucide-react";
import { useState } from "react";

export function AddNodeFab() {
  const { addNodes, screenToFlowPosition } = useReactFlow();
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  };

  return (
    <div className="absolute bottom-6 right-6 z-10">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="size-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-48 p-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Add Node
          </div>
          {paletteItems.map((item) => (
            <button
              key={item.type}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => addNode(item.type)}
            >
              <span
                className="inline-block size-2 rounded-full shrink-0"
                style={{ backgroundColor: NODE_COLORS[item.type as NodeColorKey]?.accent }}
              />
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
