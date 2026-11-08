import { MUSIC } from "../../audio/sfx-library";
import type { EpisodeDefinition } from "../types";
import { PresentacionScene } from "./PresentacionScene";
import { BEATS } from "./script";

export const ep00Presentacion: EpisodeDefinition = {
  compositionId: "TitoPresentacion",
  number: 0,
  title: "¡Hola, soy Tito!",
  learningGoal: "Conocer a Tito y su bosque; saludar y presentarse.",
  scenes: [
    {
      id: "presentacion",
      title: "Escena 1 · Tito llega al bosque",
      durationInFrames: BEATS.end,
      component: PresentacionScene,
    },
  ],
  music: [{ src: MUSIC.themeMain, volume: 0.25, fadeInFrames: 30, fadeOutFrames: 45 }],
};
