import React from "react";
import { PALETTE } from "../../theme/palette";

/** Nube esponjosa de dibujo animado. */
export const Cloud: React.FC<{ x: number; y: number; scale: number; opacity?: number }> = ({
  x,
  y,
  scale,
  opacity = 0.95,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <ellipse cx={0} cy={30} rx={150} ry={45} fill="#E3F4FF" />
    <circle cx={-70} cy={5} r={55} fill={PALETTE.cloud} />
    <circle cx={0} cy={-25} r={75} fill={PALETTE.cloud} />
    <circle cx={75} cy={0} r={58} fill={PALETTE.cloud} />
    <ellipse cx={0} cy={25} rx={140} ry={40} fill={PALETTE.cloud} />
    <ellipse cx={-20} cy={-45} rx={30} ry={14} fill="#FFFFFF" opacity={0.9} />
  </g>
);

/** Árbol redondo ("chupetín") con copa de tres círculos. */
export const RoundTree: React.FC<{
  x: number;
  y: number;
  scale: number;
  colors: readonly string[];
  sway: number;
}> = ({ x, y, scale, colors, sway }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -18 0 L -12 -170 L 12 -170 L 18 0 Z" fill={PALETTE.trunk[0]} />
    <path d="M -12 -120 L -45 -175 M 10 -140 L 40 -190" stroke={PALETTE.trunk[0]} strokeWidth={12} strokeLinecap="round" />
    <g transform={`rotate(${sway} 0 -160)`}>
      <circle cx={-60} cy={-210} r={80} fill={colors[0]} />
      <circle cx={60} cy={-215} r={78} fill={colors[0]} />
      <circle cx={0} cy={-290} r={100} fill={colors[1]} />
      <circle cx={-30} cy={-320} r={36} fill={colors[2] ?? colors[1]} opacity={0.7} />
      <circle cx={40} cy={-240} r={14} fill="#FF5A5A" />
      <circle cx={-55} cy={-250} r={12} fill="#FF5A5A" />
      <circle cx={10} cy={-200} r={11} fill="#FF5A5A" />
    </g>
  </g>
);

/** Pino estilizado en tres niveles. */
export const PineTree: React.FC<{
  x: number;
  y: number;
  scale: number;
  colors: readonly string[];
  sway: number;
}> = ({ x, y, scale, colors, sway }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-14} y={-60} width={28} height={60} fill={PALETTE.trunk[1]} />
    <g transform={`rotate(${sway} 0 -40)`}>
      <path d="M -120 -50 Q 0 -30 120 -50 L 0 -230 Z" fill={colors[0]} />
      <path d="M -100 -150 Q 0 -130 100 -150 L 0 -320 Z" fill={colors[1]} />
      <path d="M -75 -245 Q 0 -228 75 -245 L 0 -400 Z" fill={colors[2] ?? colors[1]} />
    </g>
  </g>
);

/** Flor de cinco pétalos con tallo. */
export const Flower: React.FC<{
  x: number;
  y: number;
  scale: number;
  color: string;
  sway: number;
}> = ({ x, y, scale, color, sway }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${sway})`}>
    <path d="M 0 0 Q 4 -30 0 -60" stroke="#3E9B3A" strokeWidth={6} fill="none" strokeLinecap="round" />
    <ellipse cx={12} cy={-28} rx={12} ry={6} fill="#3E9B3A" transform="rotate(-30 12 -28)" />
    <g transform="translate(0 -66)">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-15} rx={10} ry={15} fill={color} transform={`rotate(${a})`} />
      ))}
      <circle r={9} fill="#FFC21A" />
    </g>
  </g>
);

/** Matita de pasto. */
export const GrassTuft: React.FC<{ x: number; y: number; scale: number; color: string; sway: number }> = ({
  x,
  y,
  scale,
  color,
  sway,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d={`M -30 0 Q -25 -40 ${-35 + sway} -70 Q -10 -40 -5 0 Z
          M -10 0 Q 0 -60 ${5 + sway} -95 Q 15 -50 15 0 Z
          M 10 0 Q 25 -40 ${38 + sway} -65 Q 30 -30 32 0 Z`}
      fill={color}
    />
  </g>
);

/** Arbusto grande de primer plano. */
export const Bush: React.FC<{
  x: number;
  y: number;
  scale: number;
  rustle?: number;
  flip?: boolean;
}> = ({ x, y, scale, rustle = 0, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
    <g transform={`rotate(${rustle} 0 0)`}>
      <circle cx={-150} cy={-80} r={120} fill={PALETTE.forestNear[0]} />
      <circle cx={150} cy={-70} r={125} fill={PALETTE.forestNear[0]} />
      <circle cx={-40} cy={-170} r={150} fill={PALETTE.forestNear[1]} />
      <circle cx={100} cy={-150} r={120} fill={PALETTE.forestNear[1]} />
      <circle cx={-80} cy={-230} r={50} fill="#38A860" opacity={0.8} />
      <circle cx={70} cy={-210} r={36} fill="#38A860" opacity={0.8} />
      <rect x={-280} y={-80} width={560} height={90} rx={40} fill={PALETTE.forestNear[0]} />
      {[
        [-120, -140],
        [30, -200],
        [140, -110],
        [-200, -60],
        [-20, -90],
      ].map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r={14} fill={i % 2 ? "#FF6B9A" : "#B48CFF"} />
      ))}
    </g>
  </g>
);

/** Hoja que cae (se colorea con tonos de otoño suaves). */
export const Leaf: React.FC<{ x: number; y: number; rotate: number; scale: number; color: string }> = ({
  x,
  y,
  rotate,
  scale,
  color,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <path d="M 0 -30 C 22 -18 22 18 0 30 C -22 18 -22 -18 0 -30 Z" fill={color} />
    <path d="M 0 -26 L 0 30" stroke="#00000033" strokeWidth={3} />
  </g>
);

/** Mariposa con aleteo (flap 0..1). */
export const Butterfly: React.FC<{ x: number; y: number; flap: number; color: string; scale?: number; rotate?: number }> = ({
  x,
  y,
  flap,
  color,
  scale = 1,
  rotate = 0,
}) => {
  const wing = 0.25 + 0.75 * flap;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <g transform={`scale(${wing} 1)`}>
        <path d="M 0 0 C -40 -45 -70 -20 -55 5 C -70 30 -35 45 0 8 Z" fill={color} stroke="#2B1A10" strokeWidth={3} />
        <path d="M 0 0 C 40 -45 70 -20 55 5 C 70 30 35 45 0 8 Z" fill={color} stroke="#2B1A10" strokeWidth={3} />
        <circle cx={-32} cy={-10} r={7} fill="#FFFFFF" opacity={0.8} />
        <circle cx={32} cy={-10} r={7} fill="#FFFFFF" opacity={0.8} />
      </g>
      <ellipse cx={0} cy={5} rx={5} ry={20} fill="#2B1A10" />
      <path d="M -2 -14 Q -10 -32 -16 -34 M 2 -14 Q 10 -32 16 -34" stroke="#2B1A10" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
};
