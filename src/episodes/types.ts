import type React from "react";
import type { MusicCue } from "../audio/types";

export type TransitionKind = "fade" | "slide" | "wipe" | "clockWipe" | "none";

/** Una escena de un episodio. Cada escena maneja su propio tiempo desde el frame 0. */
export type SceneDefinition = {
  id: string;
  /** Nombre visible en la línea de tiempo de Remotion Studio. */
  title: string;
  durationInFrames: number;
  component: React.FC;
  /** Transición para ENTRAR a esta escena (se ignora en la primera). */
  transitionIn?: { kind: TransitionKind; durationInFrames: number };
};

/** Definición completa de un episodio educativo. */
export type EpisodeDefinition = {
  /** ID de la composición en Remotion (sólo letras, números y guiones). */
  compositionId: string;
  number: number;
  title: string;
  /** Objetivo pedagógico (para guionistas y docentes). */
  learningGoal: string;
  scenes: SceneDefinition[];
  /** Música a nivel episodio (atraviesa todas las escenas). */
  music?: MusicCue[];
};
