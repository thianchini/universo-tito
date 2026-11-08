import { Easing, interpolate, spring } from "remotion";
import { VIDEO } from "../config/video";

/** Interpolación con extremos fijos (lo que casi siempre queremos). */
export const lerp = (
  frame: number,
  input: readonly number[],
  output: readonly number[],
  easing: (t: number) => number = Easing.inOut(Easing.cubic),
): number =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Spring "de dibujo animado": rebota un poquito. */
export const bouncy = (frame: number, delay = 0, durationInFrames?: number): number =>
  spring({
    frame: frame - delay,
    fps: VIDEO.fps,
    config: { damping: 11, stiffness: 140, mass: 0.8 },
    durationInFrames,
  });

/** Spring suave sin rebote. */
export const smooth = (frame: number, delay = 0, durationInFrames?: number): number =>
  spring({
    frame: frame - delay,
    fps: VIDEO.fps,
    config: { damping: 200 },
    durationInFrames,
  });

/** Oscilación senoidal en frames (period = frames por ciclo). */
export const wave = (frame: number, period: number, amplitude = 1, phase = 0): number =>
  Math.sin((frame / period) * Math.PI * 2 + phase) * amplitude;

/** Valor 0→1→0 entre dos frames (pico en el medio), útil para saltos. */
export const arc = (frame: number, start: number, end: number): number => {
  if (frame <= start || frame >= end) return 0;
  const t = (frame - start) / (end - start);
  return Math.sin(t * Math.PI);
};
