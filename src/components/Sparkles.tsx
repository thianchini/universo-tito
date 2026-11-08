import React from "react";
import { AbsoluteFill, random } from "remotion";

/**
 * Explosión de estrellitas desde un punto. `progress` 0..1 (usar lerp/spring).
 */
export const Sparkles: React.FC<{
  x: number;
  y: number;
  progress: number;
  count?: number;
  radius?: number;
  seed?: string;
  colors?: string[];
}> = ({ x, y, progress, count = 14, radius = 380, seed = "sp", colors = ["#FFE14D", "#FFFFFF", "#FF8AD8", "#7FD3FF"] }) => {
  if (progress <= 0 || progress >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        {new Array(count).fill(0).map((_, i) => {
          const angle = (i / count) * Math.PI * 2 + random(`${seed}-a-${i}`) * 0.5;
          const dist = radius * (0.5 + random(`${seed}-d-${i}`) * 0.5) * progress;
          const s = (1 - progress) * (0.6 + random(`${seed}-s-${i}`));
          const cx = x + Math.cos(angle) * dist;
          const cy = y + Math.sin(angle) * dist;
          return (
            <path
              key={i}
              d="M 0 -30 Q 6 -6 30 0 Q 6 6 0 30 Q -6 6 -30 0 Q -6 -6 0 -30 Z"
              fill={colors[i % colors.length]}
              transform={`translate(${cx} ${cy}) rotate(${progress * 180}) scale(${s})`}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
