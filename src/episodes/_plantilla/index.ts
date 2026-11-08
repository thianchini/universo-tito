/**
 * PLANTILLA DE EPISODIO (no está registrada).
 * Copiá esta carpeta a `src/episodes/epXX-tema`, renombrá y agregala a registry.ts.
 */
import { MUSIC } from "../../audio/sfx-library";
import { sec } from "../../config/video";
import type { EpisodeDefinition } from "../types";
import { EscenaEjemplo } from "./EscenaEjemplo";

export const epPlantilla: EpisodeDefinition = {
  compositionId: "EpXX-Tema",
  number: 99,
  title: "Título del episodio",
  learningGoal: "Qué aprende el niño (ej.: contar del 1 al 5).",
  scenes: [
    { id: "intro", title: "Escena 1 · Intro", durationInFrames: sec(6), component: EscenaEjemplo },
    {
      id: "desarrollo",
      title: "Escena 2 · Desarrollo",
      durationInFrames: sec(6),
      component: EscenaEjemplo,
      transitionIn: { kind: "slide", durationInFrames: 15 },
    },
  ],
  music: [{ src: MUSIC.forestAmbience, volume: 0.2 }],
};
