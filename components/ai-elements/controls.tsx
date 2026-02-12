"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { Controls as ControlsPrimitive } from "@xyflow/react";

export type ControlsProps = ComponentProps<typeof ControlsPrimitive>;

export const Controls = ({ className, ...props }: ControlsProps) => (
  <ControlsPrimitive
    className={cn(
      "gap-px overflow-hidden rounded-md border bg-card p-1 shadow-none!",
      "[&>button]:rounded-md [&>button]:border-none! [&>button]:bg-transparent! [&>button]:hover:bg-secondary!",
      "[&>button]:min-h-8 [&>button]:min-w-8 sm:[&>button]:min-h-6 sm:[&>button]:min-w-6",
      className
    )}
    {...props}
  />
);
