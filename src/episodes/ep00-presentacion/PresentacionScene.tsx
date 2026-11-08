import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { AudioLayer } from "../../audio/AudioLayer";
import { mouthFor } from "../../audio/dialogue";
import {
  Camera,
  CHARACTER_DEPTH,
  ForestBackground,
  ForestForeground,
  GROUND_Y,
  WorldLayer,
  worldToScreen,
} from "../../backgrounds/forest";
import { CharacterOnStage } from "../../characters/CharacterOnStage";
import { Tito, titoIdle, TitoPose } from "../../characters/tito";
import { IrisOut } from "../../components/IrisOut";
import { Sparkles } from "../../components/Sparkles";
import { Subtitles } from "../../components/Subtitles";
import { TitleLogo } from "../../components/TitleLogo";
import { arc, bouncy, lerp, wave } from "../../lib/motion";
import { BEATS as B, DIALOGUE, SFX_CUES } from "./script";

const TITO_HEIGHT = 760;
const STAGE_X = 540;
const STAGE_Y = GROUND_Y + 60;
/** Detrás del arbusto derecho. */
const HIDE_X = 860;
const HIDE_Y = 2380;
const PEEK_Y = 2010;

/** Movimiento de cámara: baja del cielo, luego paneo suave y acercamiento. */
const cameraAt = (f: number): Camera => {
  const descend = lerp(f, [0, B.cameraDescendEnd], [1250, 0], Easing.inOut(Easing.cubic));
  const panX = lerp(f, [B.lookAroundStart, B.lookAroundStart + 45, B.lookAroundEnd], [0, -70, 50]);
  const zoom =
    1 + lerp(f, [B.jumpLand, B.waveEnd], [0, 0.06]) + lerp(f, [B.byeStart - 20, B.irisStart], [0, 0.08], Easing.inOut(Easing.quad));
  // Pequeño temblor de cámara cuando Tito aterriza
  const shake = arc(f, B.jumpLand, B.jumpLand + 8) * wave(f, 3, 10);
  return { x: panX, y: descend + shake, zoom };
};

/** Dónde están los pies de Tito y cuánto está girado. */
const titoPlacement = (f: number): { x: number; y: number; rotate: number } => {
  if (f < B.jumpStart) {
    // Asoma por detrás del arbusto
    const peek = bouncy(f, B.peekStart);
    const sink = lerp(f, [B.jumpStart - 12, B.jumpStart], [0, 60]); // agacharse antes de saltar
    return { x: HIDE_X + wave(f, 30, 6), y: HIDE_Y - (HIDE_Y - PEEK_Y) * peek + sink, rotate: wave(f, 40, 3) };
  }
  if (f < B.jumpLand) {
    const t = (f - B.jumpStart) / (B.jumpLand - B.jumpStart);
    const x = HIDE_X + (STAGE_X - HIDE_X) * Easing.inOut(Easing.quad)(t);
    const baseY = PEEK_Y + 60 + (STAGE_Y - PEEK_Y - 60) * t;
    const y = baseY - Math.sin(t * Math.PI) * 620;
    return { x, y, rotate: -14 * Math.sin(t * Math.PI) };
  }
  // Saltitos de alegría
  const hop = arc(f, B.hop1, B.hop1 + 22) * 170 + arc(f, B.hop2, B.hop2 + 22) * 200;
  return { x: STAGE_X, y: STAGE_Y - hop, rotate: 0 };
};

/** Pose expresiva de Tito según el momento de la escena. */
const titoPose = (f: number): TitoPose => {
  const idle = titoIdle(f);
  const pose: TitoPose = { ...idle, mouthOpen: mouthFor(f, DIALOGUE, "tito") };

  if (f < B.jumpStart) {
    // Curioso: mira a un lado y al otro, orejas atentas
    pose.expression = "curioso";
    pose.lookX = lerp(f, [B.peekStart + 15, B.peekStart + 25, B.peekStart + 35, B.peekStart + 45], [0, -1, -1, 0.6]);
    pose.earLeft = (idle.earLeft ?? 0) + wave(f, 12, 6);
    pose.earRight = (idle.earRight ?? 0) - wave(f, 12, 6);
    pose.squash = lerp(f, [B.jumpStart - 12, B.jumpStart], [0, 0.35]);
  } else if (f < B.jumpLand) {
    // En el aire: estirado, brazos arriba, cola flameando
    const t = (f - B.jumpStart) / (B.jumpLand - B.jumpStart);
    pose.expression = "sorpresa";
    pose.squash = -0.35 * Math.sin(t * Math.PI);
    pose.armRight = -140;
    pose.armLeft = 120;
    pose.tail = 25 * Math.sin(t * Math.PI * 2);
    pose.scarfFlutter = -25 + wave(f, 6, 10);
    pose.lookY = -0.6;
  } else {
    // Aterrizaje con aplastamiento elástico
    const landing = bouncy(f, B.jumpLand);
    pose.squash = (1 - landing) * 0.5 * Math.cos((f - B.jumpLand) * 0.6);
    pose.expression = "feliz";
  }

  // Saluda: "¡Hola! ¡Soy Tito!"
  if (f >= B.waveStart && f < B.waveEnd) {
    const up = bouncy(f, B.waveStart) * lerp(f, [B.waveEnd - 12, B.waveEnd], [1, 0]);
    pose.armRight = -150 * up + wave(f, 10, 22) * up;
    pose.headTilt = 6 * up + wave(f, 20, 2);
  }

  // Mira el bosque alrededor y lo señala
  if (f >= B.lookAroundStart && f < B.lookAroundEnd) {
    pose.expression = "curioso";
    pose.lookX = lerp(f, [B.lookAroundStart, B.lookAroundStart + 25, B.lookAroundStart + 55, B.lookAroundEnd - 10], [0, -1, 1, 0]);
    pose.lookY = -0.3;
    pose.headTilt = lerp(f, [B.lookAroundStart, B.lookAroundStart + 25, B.lookAroundStart + 55, B.lookAroundEnd - 10], [0, -8, 8, 0]);
    const point = lerp(f, [B.lookAroundStart + 5, B.lookAroundStart + 20, B.lookAroundEnd - 20, B.lookAroundEnd], [0, 1, 1, 0]);
    pose.armLeft = 100 * point + wave(f, 25, 5) * point;
  }

  // Saltitos de alegría: brazos arriba en cada salto
  const hopping = Math.max(arc(f, B.hop1, B.hop1 + 22), arc(f, B.hop2, B.hop2 + 22));
  if (hopping > 0) {
    pose.armRight = -150 * hopping;
    pose.armLeft = 140 * hopping;
    pose.squash = -0.25 * hopping;
    pose.blink = 1; // ojitos cerrados de felicidad
    pose.tail = (pose.tail ?? 0) + 20 * hopping;
  }
  // Mini-aplastamiento al aterrizar cada saltito
  for (const h of [B.hop1 + 22, B.hop2 + 22]) {
    pose.squash = (pose.squash ?? 0) + arc(f, h, h + 8) * 0.3;
  }

  // Despedida con guiño
  if (f >= B.byeStart) {
    const up = bouncy(f, B.byeStart);
    pose.armRight = -150 * up + wave(f, 8, 25) * up;
    pose.expression = f > B.byeStart + 15 ? "guino" : "feliz";
    pose.headTilt = -6 * up;
  }

  return pose;
};

/**
 * ESCENA: Presentación de Tito en el bosque (18 s).
 * 1) La cámara baja del cielo mientras aparece el logo.
 * 2) Tito asoma detrás de un arbusto, curioso.
 * 3) Salta al centro, aterriza y saluda.
 * 4) Presenta su bosque, salta de alegría y se despide con un cierre de iris.
 */
export const PresentacionScene: React.FC = () => {
  const f = useCurrentFrame();
  const camera = cameraAt(f);
  const place = titoPlacement(f);
  const pose = titoPose(f);

  const logoExit = lerp(f, [B.logoOut, B.logoOut + 24], [0, 1], Easing.in(Easing.back(1.4)));
  const rustle =
    arc(f, B.peekStart - 2, B.peekStart + 20) * wave(f, 4, 6) + arc(f, B.jumpStart - 6, B.jumpStart + 16) * wave(f, 3, 9);

  // Posición de la cabeza de Tito en pantalla para destellos y cierre de iris
  const head = worldToScreen({ x: place.x, y: place.y - TITO_HEIGHT * 0.62 }, CHARACTER_DEPTH, camera);
  const feet = worldToScreen({ x: STAGE_X, y: STAGE_Y - 80 }, CHARACTER_DEPTH, camera);

  return (
    <AbsoluteFill>
      <ForestBackground camera={camera} />

      <WorldLayer depth={CHARACTER_DEPTH} camera={camera}>
        <CharacterOnStage x={place.x} y={place.y} height={TITO_HEIGHT} rotate={place.rotate}>
          <Tito pose={pose} height={TITO_HEIGHT} />
        </CharacterOnStage>
      </WorldLayer>

      <ForestForeground camera={camera} bushRustle={rustle} />

      <Sparkles x={feet.x} y={feet.y} progress={lerp(f, [B.jumpLand, B.jumpLand + 28], [0, 1], Easing.out(Easing.quad))} seed="land" radius={420} />
      <Sparkles x={head.x} y={head.y - 330} progress={lerp(f, [B.hop1 + 10, B.hop1 + 40], [0, 1])} seed="hop1" count={16} />
      <Sparkles x={head.x} y={head.y - 330} progress={lerp(f, [B.hop2 + 10, B.hop2 + 44], [0, 1])} seed="hop2" count={18} radius={460} />

      {f < B.logoOut + 30 && <TitleLogo frame={f - B.logoIn} exit={logoExit} top={420} />}

      <Subtitles lines={DIALOGUE} />

      <IrisOut x={head.x} y={head.y} progress={lerp(f, [B.irisStart, B.end - 4], [0, 1], Easing.in(Easing.cubic))} />

      <AudioLayer dialogue={DIALOGUE} sfx={SFX_CUES} />
    </AbsoluteFill>
  );
};
