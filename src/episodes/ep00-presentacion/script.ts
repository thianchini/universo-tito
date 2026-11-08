import { buildDialogue } from "../../audio/dialogue";
import { SFX } from "../../audio/sfx-library";
import type { SfxCue } from "../../audio/types";
import { VIDEO } from "../../config/video";

/**
 * GUION — Episodio 0: "¡Hola, soy Tito!"
 * Tiempos en SEGUNDOS desde el inicio de la escena.
 * Para agregar la voz, grabá cada línea y guardala con el nombre de `voice`
 * dentro de public/ (ej. public/audio/voces/ep00/01-hola.mp3). Se reproduce sola.
 */
export const DIALOGUE = buildDialogue(VIDEO.fps, [
  { id: "hola", speaker: "tito", at: 7.2, seconds: 2.4, text: "¡Hola! ¡Soy Tito!", voice: "audio/voces/ep00/01-hola.mp3" },
  {
    id: "bosque",
    speaker: "tito",
    at: 10.0,
    seconds: 3.0,
    text: "Vivo en este bosque lleno de colores.",
    voice: "audio/voces/ep00/02-bosque.mp3",
  },
  {
    id: "aprender",
    speaker: "tito",
    at: 13.2,
    seconds: 2.5,
    text: "¿Vamos a aprender juntos?",
    voice: "audio/voces/ep00/03-aprender.mp3",
  },
  { id: "chau", speaker: "tito", at: 15.9, seconds: 1.4, text: "¡Hasta pronto!", voice: "audio/voces/ep00/04-chau.mp3" },
]);

/** Momentos clave de la animación (frames). Centralizados para sincronizar SFX. */
export const BEATS = {
  logoIn: 8,
  logoOut: 96,
  cameraDescendEnd: 120,
  peekStart: 118,
  jumpStart: 168,
  jumpLand: 200,
  waveStart: 210,
  waveEnd: 290,
  lookAroundStart: 300,
  lookAroundEnd: 395,
  hop1: 425,
  hop2: 452,
  byeStart: 476,
  irisStart: 510,
  end: 540,
} as const;

export const SFX_CUES: SfxCue[] = [
  { id: "pajaritos", src: SFX.birds, from: 0, volume: 0.4, durationInFrames: 180 },
  { id: "logo-pop", src: SFX.pop, from: BEATS.logoIn + 22 },
  { id: "logo-whoosh", src: SFX.whoosh, from: BEATS.logoOut },
  { id: "arbusto-1", src: SFX.rustle, from: BEATS.peekStart },
  { id: "arbusto-2", src: SFX.rustle, from: BEATS.jumpStart - 4 },
  { id: "salto", src: SFX.boing, from: BEATS.jumpStart },
  { id: "aterrizaje", src: SFX.landing, from: BEATS.jumpLand },
  { id: "brillo-1", src: SFX.sparkle, from: BEATS.hop1 + 18 },
  { id: "brillo-2", src: SFX.sparkle, from: BEATS.hop2 + 18 },
];
