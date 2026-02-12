import type { ConnectionLineComponent } from "@xyflow/react";
import { memo } from "react";

const HALF = 0.5;

const ConnectionComponent: ConnectionLineComponent = ({
  fromX,
  fromY,
  toX,
  toY,
}) => (
  <g>
    <path
      className="animated"
      d={`M${fromX},${fromY} C ${fromX + (toX - fromX) * HALF},${fromY} ${fromX + (toX - fromX) * HALF},${toY} ${toX},${toY}`}
      fill="none"
      stroke="var(--color-ring)"
      strokeWidth={1}
    />
    <circle
      cx={toX}
      cy={toY}
      fill="#fff"
      r={3}
      stroke="var(--color-ring)"
      strokeWidth={1}
    />
  </g>
);

export const Connection = memo(ConnectionComponent, (prev, next) => {
  return (
    prev.fromX === next.fromX &&
    prev.fromY === next.fromY &&
    prev.toX === next.toX &&
    prev.toY === next.toY
  );
}) as ConnectionLineComponent;
