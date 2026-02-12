import type { ComponentProps, CSSProperties } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Handle, Position } from "@xyflow/react";

export type NodeProps = ComponentProps<typeof Card> & {
  handles: {
    target: boolean;
    source: boolean;
  };
  nodeType?: string;
  selected?: boolean;
  accentColor?: string;
};

export const Node = ({
  handles,
  className,
  selected,
  accentColor,
  style,
  ...props
}: NodeProps) => {
  const selectedStyle: CSSProperties = selected && accentColor
    ? { borderColor: accentColor, borderWidth: 2, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
    : {};

  return (
    <Card
      className={cn(
        "node-container relative min-w-[180px] max-w-[240px] rounded-lg bg-card border p-0 gap-0 shadow-sm",
        "transition-shadow duration-150",
        className
      )}
      style={{ ...style, ...selectedStyle }}
      {...props}
    >
      {handles.target && <Handle position={Position.Left} type="target" />}
      {handles.source && <Handle position={Position.Right} type="source" />}
      {props.children}
    </Card>
  );
};

export type NodeHeaderProps = ComponentProps<typeof CardHeader>;

export const NodeHeader = ({ className, ...props }: NodeHeaderProps) => (
  <CardHeader
    className={cn("gap-0.5 rounded-t-lg border-b border-border/50 p-3! bg-card", className)}
    {...props}
  />
);

export type NodeTitleProps = ComponentProps<typeof CardTitle>;

export const NodeTitle = (props: NodeTitleProps) => <CardTitle {...props} />;

export type NodeDescriptionProps = ComponentProps<typeof CardDescription>;

export const NodeDescription = (props: NodeDescriptionProps) => (
  <CardDescription {...props} />
);

export type NodeActionProps = ComponentProps<typeof CardAction>;

export const NodeAction = (props: NodeActionProps) => <CardAction {...props} />;

export type NodeContentProps = ComponentProps<typeof CardContent>;

export const NodeContent = ({ className, ...props }: NodeContentProps) => (
  <CardContent className={cn("p-3", className)} {...props} />
);

export type NodeFooterProps = ComponentProps<typeof CardFooter>;

export const NodeFooter = ({ className, ...props }: NodeFooterProps) => (
  <CardFooter
    className={cn("rounded-b-lg border-t bg-secondary p-3!", className)}
    {...props}
  />
);
