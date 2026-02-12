import type { ConnectionLineComponent } from "@xyflow/react";
import { memo } from "react";

const HALF = 0.5;

const ConnectionComponent: ConnectionLineComponent = ({
  fromX,
  fromY,
  toX,
  toY,
}) => {
  const path = `M${fromX},${fromY} C ${fromX + (toX - fromX) * HALF},${fromY} ${fromX + (toX - fromX) * HALF},${toY} ${toX},${toY}`;

  return (
    <g>
      {/* Glow path behind */}
      <path
        d={path}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={4}
        strokeOpacity={0.15}
      />
      {/* Main animated dashed path */}
      <path
        className="connection-animated"
        d={path}
        fill="none"
        stroke="var(--color-ring)"
        strokeWidth={1.5}
        strokeDasharray="6,4"
      />
      {/* Endpoint circle */}
      <circle
        cx={toX}
        cy={toY}
        fill="var(--color-background)"
        r={4}
        stroke="var(--color-primary)"
        strokeWidth={1.5}
      />
    </g>
  );
};

export const Connection = memo(ConnectionComponent, (prev, next) => {
  return (
    prev.fromX === next.fromX &&
    prev.fromY === next.fromY &&
    prev.toX === next.toX &&
    prev.toY === next.toY
  );
}) as ConnectionLineComponent;
