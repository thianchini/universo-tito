import { talkingMouth } from "../characters/tito/idle";
import type { DialogueLine, Speaker } from "./types";

/** Línea de diálogo activa en el frame dado (o null). */
export const activeLine = (frame: number, lines: DialogueLine[]): DialogueLine | null =>
  lines.find((l) => frame >= l.from && frame < l.from + l.durationInFrames) ?? null;

/**
 * Apertura de boca de un personaje en el frame dado.
 * Hoy: animación procedural mientras su línea está activa.
 * Futuro: reemplazar por amplitud real de la voz (visualizeAudio de
 * @remotion/media-utils) sin cambiar las escenas que usan esta función.
 */
export const mouthFor = (frame: number, lines: DialogueLine[], speaker: Speaker): number => {
  const line = activeLine(frame, lines);
  if (!line || line.speaker !== speaker) return 0;
  const local = frame - line.from;
  // Cerrar la boca en los últimos frames de la línea
  const tail = line.durationInFrames - local;
  const env = Math.min(1, local / 3, tail / 6);
  return talkingMouth(frame) * Math.max(0, env);
};

/** Crea líneas de diálogo encadenadas a partir de segundos (más cómodo para guionistas). */
export const buildDialogue = (
  fps: number,
  lines: Array<Omit<DialogueLine, "from" | "durationInFrames"> & { at: number; seconds: number }>,
): DialogueLine[] =>
  lines.map(({ at, seconds, ...rest }) => ({
    ...rest,
    from: Math.round(at * fps),
    durationInFrames: Math.round(seconds * fps),
  }));
