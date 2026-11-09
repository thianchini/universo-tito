import React, { useMemo } from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { AudioLayer } from "../../audio/AudioLayer";
import { SFX } from "../../audio/sfx-library";
import type { DialogueLine } from "../../audio/types";
import { Camera, CHARACTER_DEPTH, ForestBackground, ForestForeground, GROUND_Y, WorldLayer } from "../../backgrounds/forest";
import { Butterfly } from "../../backgrounds/forest/elements";
import { CharacterOnStage } from "../../characters/CharacterOnStage";
import { TitoRig } from "../../characters/tito-rig/TitoRig";
import { TITO_VIEWBOX } from "../../characters/tito/design";
import { Subtitles } from "../../components/Subtitles";
import { lerp } from "../../lib/motion";
import { butterflyAt, createDemoPerformance, DEMO_SPEECH, JUMP } from "./script";

const HEIGHT = 780;
const STAGE_X = 540;
const STAGE_Y = GROUND_Y + 70;

const DIALOGUE: DialogueLine[] = DEMO_SPEECH.map((s, i) => ({
  id: `demo-${i}`,
  speaker: "tito",
  from: s.from,
  durationInFrames: s.durationInFrames + 8,
  text: s.text,
  voice: "audio/voces/demo/hola-soy-tito.mp3",
}));

/** Capa SVG con las mismas coordenadas que el rig (para objetos que interactúan con Tito). */
const RigSpace: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const width = (HEIGHT * TITO_VIEWBOX.width) / TITO_VIEWBOX.height;
  return (
    <svg width={width} height={HEIGHT} viewBox={`0 0 ${TITO_VIEWBOX.width} ${TITO_VIEWBOX.height}`} style={{ overflow: "visible", position: "absolute", left: 0, top: 0 }}>
      {children}
    </svg>
  );
};

/** DEMO de calidad de animación del rig v3 (10 s). */
export const TitoDemo: React.FC<{ showBones?: boolean }> = ({ showBones = false }) => {
  const f = useCurrentFrame();
  const perf = useMemo(() => createDemoPerformance(), []);
  const c = perf.channelsAt(f);
  const sec = perf.secondaryAt(f);

  // Cámara: acercamiento lento y un pequeño temblor al aterrizar.
  const shake = f >= JUMP.land && f < JUMP.land + 10 ? Math.sin((f - JUMP.land) * 2.4) * (1 - (f - JUMP.land) / 10) * 7 : 0;
  const camera: Camera = { x: 0, y: shake, zoom: lerp(f, [0, 300], [1, 1.05], Easing.inOut(Easing.quad)) };
  const b = butterflyAt(f);
  const flap = (Math.sin(f * 1.3) + 1) / 2;

  return (
    <AbsoluteFill>
      <ForestBackground camera={camera} />
      <WorldLayer depth={CHARACTER_DEPTH} camera={camera}>
        <CharacterOnStage x={STAGE_X} y={STAGE_Y} height={HEIGHT}>
          <TitoRig c={c} secondary={sec} height={HEIGHT} showBones={showBones} />
          <RigSpace>
            <Butterfly x={b.x} y={b.y} flap={flap} color="#FF8AD8" scale={1.25} rotate={Math.sin(f * 0.21) * 18} />
          </RigSpace>
        </CharacterOnStage>
      </WorldLayer>
      <ForestForeground camera={camera} showButterflies={false} />
      <Subtitles lines={DIALOGUE} />
      <AudioLayer
        dialogue={DIALOGUE}
        sfx={[
          { id: "brillo", src: SFX.sparkle, from: 40 },
          { id: "salto", src: SFX.boing, from: JUMP.takeoff },
          { id: "aterrizaje", src: SFX.landing, from: JUMP.land },
        ]}
      />
    </AbsoluteFill>
  );
};
