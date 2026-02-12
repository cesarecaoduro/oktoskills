"use client";

import type { AppNode } from "@/lib/flow/types";
import { NODE_COLORS, type NodeColorKey } from "@/lib/flow/node-colors";
import { paletteItems, defaultNodeData } from "@/lib/flow/node-defaults";
import { useReactFlow } from "@xyflow/react";
import { nanoid } from "nanoid";
import { Maximize2, MousePointer2 } from "lucide-react";
import { useEffect, useRef } from "react";

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
};

export function CanvasContextMenu({ x, y, onClose }: ContextMenuProps) {
  const { addNodes, screenToFlowPosition, fitView, setNodes } = useReactFlow();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const addNode = (type: string) => {
    const position = screenToFlowPosition({ x, y });
    addNodes({
      id: nanoid(),
      type: type as AppNode["type"],
      position,
      data: { ...defaultNodeData[type] } as AppNode["data"],
    } as AppNode);
    onClose();
  };

  const handleSelectAll = () => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
    onClose();
  };

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 200 });
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
      style={{ left: x, top: y }}
    >
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
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: NODE_COLORS[item.type as NodeColorKey]?.accent }}
          />
          <item.icon className="size-4" />
          {item.label}
        </button>
      ))}
      <div className="-mx-1 my-1 h-px bg-border" />
      <button
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={handleSelectAll}
      >
        <MousePointer2 className="size-4" />
        Select All
      </button>
      <button
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={handleFitView}
      >
        <Maximize2 className="size-4" />
        Fit View
      </button>
    </div>
  );
}
