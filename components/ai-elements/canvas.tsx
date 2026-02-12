"use client";

import type { ReactFlowProps } from "@xyflow/react";
import type { ReactNode } from "react";

import { Background, BackgroundVariant, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";

type CanvasProps = ReactFlowProps & {
  children?: ReactNode;
};

const deleteKeyCode = ["Backspace", "Delete"];

export const Canvas = ({ children, ...props }: CanvasProps) => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);

  return (
    <ReactFlow
      deleteKeyCode={deleteKeyCode}
      panOnDrag={isTouch ? [1, 2] : [1]}
      panOnScroll={false}
      zoomOnScroll={!isTouch}
      selectionOnDrag={!isTouch}
      zoomOnPinch={isTouch}
      zoomOnDoubleClick={false}
      fitView
      fitViewOptions={{ padding: 0.5, maxZoom: 1 }}
      minZoom={0.1}
      maxZoom={2}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      {...props}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1.5}
        className="!bg-editor-bg [&>pattern>circle]:fill-editor-grid"
      />
      {children}
    </ReactFlow>
  );
};
