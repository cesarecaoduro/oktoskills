import type { EdgeProps, InternalNode, Node } from "@xyflow/react";

import { memo, useMemo, useState } from "react";
import {
  BaseEdge,
  getBezierPath,
  getSimpleBezierPath,
  getSmoothStepPath,
  Position,
  useInternalNode,
} from "@xyflow/react";
import { cn } from "@/lib/utils";

const Temporary = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) => {
  const [edgePath] = getSimpleBezierPath({
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      className="stroke-1 stroke-ring"
      id={id}
      path={edgePath}
      style={{
        strokeDasharray: "5, 5",
      }}
    />
  );
};

const getHandleCoordsByPosition = (
  node: InternalNode<Node>,
  handlePosition: Position,
  handleId?: string | null
) => {
  // Choose the handle type based on position - Left is for target, Right is for source
  const handleType = handlePosition === Position.Left ? "target" : "source";
  const handles = node.internals.handleBounds?.[handleType];

  const handle = handleId
    ? handles?.find((h) => h.id === handleId)
    : handles?.find((h) => h.position === handlePosition);

  if (!handle) {
    return [0, 0] as const;
  }

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // this is a tiny detail to make the markerEnd of an edge visible.
  // The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
  // when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
  switch (handlePosition) {
    case Position.Left: {
      offsetX = 0;
      break;
    }
    case Position.Right: {
      offsetX = handle.width;
      break;
    }
    case Position.Top: {
      offsetY = 0;
      break;
    }
    case Position.Bottom: {
      offsetY = handle.height;
      break;
    }
    default: {
      throw new Error(`Invalid handle position: ${handlePosition}`);
    }
  }

  const x = node.internals.positionAbsolute.x + handle.x + offsetX;
  const y = node.internals.positionAbsolute.y + handle.y + offsetY;

  return [x, y] as const;
};

const getEdgeParams = (
  source: InternalNode<Node>,
  target: InternalNode<Node>,
  sourceHandleId?: string | null,
  targetHandleId?: string | null
) => {
  const sourcePos = Position.Right;
  const [sx, sy] = getHandleCoordsByPosition(source, sourcePos, sourceHandleId);
  const targetPos = Position.Left;
  const [tx, ty] = getHandleCoordsByPosition(target, targetPos, targetHandleId);

  return {
    sourcePos,
    sx,
    sy,
    targetPos,
    tx,
    ty,
  };
};

const Animated = memo(function Animated({ id, source, target, sourceHandleId, targetHandleId, markerEnd, style, data }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const [isHovered, setIsHovered] = useState(false);

  const edgeParams = useMemo(() => {
    if (!(sourceNode && targetNode)) return null;
    return getEdgeParams(sourceNode, targetNode, sourceHandleId, targetHandleId);
  }, [sourceNode, targetNode, sourceHandleId, targetHandleId]);

  const edgePath = useMemo(() => {
    if (!edgeParams) return "";
    const { sx, sy, tx, ty, sourcePos, targetPos } = edgeParams;
    const [path] = getBezierPath({
      sourcePosition: sourcePos,
      sourceX: sx,
      sourceY: sy,
      targetPosition: targetPos,
      targetX: tx,
      targetY: ty,
    });
    return path;
  }, [edgeParams]);

  if (!(sourceNode && targetNode)) {
    return null;
  }

  return (
    <>
      <BaseEdge
        id={id}
        markerEnd={markerEnd}
        path={edgePath}
        style={style}
        className={cn(isHovered && "stroke-2")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {data?.animated === true && (
        <circle fill="var(--primary)" r="4">
          <animateMotion dur="3s" path={edgePath} repeatCount="indefinite" />
        </circle>
      )}
    </>
  );
});

const SmoothStep = memo(function SmoothStep({ id, source, target, sourceHandleId, targetHandleId, markerEnd, style, data }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const [isHovered, setIsHovered] = useState(false);

  const edgeParams = useMemo(() => {
    if (!(sourceNode && targetNode)) return null;
    return getEdgeParams(sourceNode, targetNode, sourceHandleId, targetHandleId);
  }, [sourceNode, targetNode, sourceHandleId, targetHandleId]);

  const edgePath = useMemo(() => {
    if (!edgeParams) return "";
    const { sx, sy, tx, ty, sourcePos, targetPos } = edgeParams;
    const [path] = getSmoothStepPath({
      sourceX: sx,
      sourceY: sy,
      targetX: tx,
      targetY: ty,
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      borderRadius: 8,
    });
    return path;
  }, [edgeParams]);

  if (!(sourceNode && targetNode)) return null;

  return (
    <>
      <BaseEdge
        id={id}
        markerEnd={markerEnd}
        path={edgePath}
        style={style}
        className={cn(isHovered && "stroke-2")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {data?.animated === true && (
        <circle fill="var(--primary)" r="4">
          <animateMotion dur="3s" path={edgePath} repeatCount="indefinite" />
        </circle>
      )}
    </>
  );
});

export const Edge = {
  Animated,
  SmoothStep,
  Temporary,
};
