import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AudioLayer, buildDialogue, mouthFor } from "../../audio";
import { CHARACTER_DEPTH, ForestBackground, ForestForeground, GROUND_Y, WorldLayer } from "../../backgrounds/forest";
import { CharacterOnStage } from "../../characters/CharacterOnStage";
import { Tito, titoIdle } from "../../characters/tito";
import { Subtitles } from "../../components/Subtitles";
import { VIDEO } from "../../config/video";

const DIALOGO = buildDialogue(VIDEO.fps, [
  { id: "l1", speaker: "tito", at: 1, seconds: 2.5, text: "¡Texto de ejemplo!", voice: "audio/voces/epXX/01.mp3" },
]);

/** Escena mínima: fondo + Tito en reposo hablando + subtítulos + audio. */
export const EscenaEjemplo: React.FC = () => {
  const f = useCurrentFrame();
  const camera = { x: 0, y: 0, zoom: 1 };
  return (
    <AbsoluteFill>
      <ForestBackground camera={camera} />
      <WorldLayer depth={CHARACTER_DEPTH} camera={camera}>
        <CharacterOnStage x={540} y={GROUND_Y + 60} height={760}>
          <Tito pose={{ ...titoIdle(f), mouthOpen: mouthFor(f, DIALOGO, "tito") }} height={760} />
        </CharacterOnStage>
      </WorldLayer>
      <ForestForeground camera={camera} />
      <Subtitles lines={DIALOGO} />
      <AudioLayer dialogue={DIALOGO} />
    </AbsoluteFill>
  );
};
