import { wave } from "../../lib/motion";
import type { TitoPose } from "./Tito";

/** Frames (relativos) en los que Tito parpadea. Irregular para que se vea vivo. */
const BLINK_EVERY = [0, 95, 170, 290, 335, 460, 560, 650, 760, 880];
const BLINK_LENGTH = 7;

/** Devuelve 0..1 de parpadeo para el frame dado (se repite cada 900 frames). */
export const blinkAt = (frame: number): number => {
  const f = ((frame % 900) + 900) % 900;
  for (const start of BLINK_EVERY) {
    const t = f - start;
    if (t >= 0 && t < BLINK_LENGTH) {
      return Math.sin((t / BLINK_LENGTH) * Math.PI);
    }
  }
  return 0;
};

/**
 * Animación "idle" (en reposo): respiración, cola, orejas, bufanda y parpadeo.
 * Se combina con la pose de la escena: `{...titoIdle(frame), ...poseDeLaEscena}`.
 */
export const titoIdle = (frame: number): TitoPose => ({
  blink: blinkAt(frame),
  breath: (wave(frame, 75) + 1) / 2,
  headBob: wave(frame, 75, 4, 0.6),
  tail: wave(frame, 48, 7),
  earLeft: wave(frame, 130, 2) + (frame % 210 > 200 ? -8 : 0),
  earRight: wave(frame, 130, 2, 1.3),
  scarfFlutter: wave(frame, 36, 5),
  armLeft: wave(frame, 75, 2),
  armRight: wave(frame, 75, -2),
});

/** Movimiento de boca simple mientras habla (sin audio). Ver audio/lipsync.ts. */
export const talkingMouth = (frame: number): number => {
  const a = Math.abs(Math.sin(frame * 0.85));
  const b = Math.abs(Math.sin(frame * 0.37 + 1));
  return 0.25 + 0.75 * a * (0.5 + 0.5 * b);
};
