import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

/**
 * Cierre de iris clásico de dibujo animado: un círculo que se achica sobre un
 * punto. `progress` 0 = abierto, 1 = cerrado del todo.
 */
export const IrisOut: React.FC<{ x: number; y: number; progress: number; color?: string }> = ({
  x,
  y,
  progress,
  color = "#1B1030",
}) => {
  const { width, height } = useVideoConfig();
  if (progress <= 0) return null;
  const maxR = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
  const r = Math.max(0, maxR * (1 - progress));
  return (
    <AbsoluteFill>
      <svg width={width} height={height}>
        <defs>
          <mask id="iris-mask">
            <rect width={width} height={height} fill="#fff" />
            <circle cx={x} cy={y} r={r} fill="#000" />
          </mask>
        </defs>
        <rect width={width} height={height} fill={color} mask="url(#iris-mask)" />
      </svg>
    </AbsoluteFill>
  );
};
