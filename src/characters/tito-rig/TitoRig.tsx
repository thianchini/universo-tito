import React, { useId } from "react";
import type { Vec } from "../../rig/math";
import { toSvg } from "../../rig/matrix";
import { TITO_COLORS as C, TITO_FEET, TITO_VIEWBOX } from "../tito/design";
import { Arm, Leg, ScarfBand, ScarfEnd, Tail, Torso } from "./body";
import { kinematicChain, SCARF, TAIL } from "./chains";
import type { TitoChannels } from "./channels";
import { HeadArt } from "./head";
import { solveSkeleton } from "./skeleton";

/** Resultado de la física secundaria para un frame (si no hay, se usa la pose de reposo). */
export type TitoSecondary = {
  tail: Vec[];
  scarf: Vec[];
  /** Desvío de cada oreja en grados respecto de su pose (por inercia). */
  earL: number;
  earR: number;
};

export type TitoRigProps = {
  c: TitoChannels;
  secondary?: TitoSecondary;
  height?: number;
  /** Muestra el esqueleto encima del dibujo (para revisar la animación). */
  showBones?: boolean;
  style?: React.CSSProperties;
};

/**
 * TITO (rig v3): personaje deformable. El cuerpo se curva y se aplasta con
 * volumen, brazos y piernas son tubos continuos, y cola, orejas y bufanda
 * reciben la inercia calculada por la física secundaria.
 */
export const TitoRig: React.FC<TitoRigProps> = ({ c, secondary, height = 820, showBones = false, style }) => {
  const uid = `tito${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const sk = solveSkeleton(c);
  const width = (height * TITO_VIEWBOX.width) / TITO_VIEWBOX.height;

  const tail = secondary?.tail ?? kinematicChain(TAIL, sk.tailBase, sk.tailBaseAngle, c.tailCurl);
  const scarf = secondary?.scarf ?? kinematicChain(SCARF, sk.scarfKnot, sk.chestAngle);
  const earL = c.earL * -1 + (secondary?.earL ?? 0);
  const earR = c.earR + (secondary?.earR ?? 0);

  // La sombra se achica y se aclara cuando Tito está en el aire.
  const air = Math.max(0, -c.rootY);
  const shadowScale = 1 / (1 + air / 420);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${TITO_VIEWBOX.width} ${TITO_VIEWBOX.height}`} style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={`${uid}-iris`} cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FFD27A" />
          <stop offset="55%" stopColor={C.iris} />
          <stop offset="100%" stopColor={C.irisDark} />
        </radialGradient>
        {/* Luz compartida por cuerpo y brazos (espacio del personaje): las uniones no se notan. */}
        <radialGradient id={`${uid}-fur`} gradientUnits="userSpaceOnUse" cx={250 + c.rootX} cy={500 + c.rootY} r={330}>
          <stop offset="0%" stopColor={C.furLight} />
          <stop offset="62%" stopColor={C.fur} />
          <stop offset="100%" stopColor={C.furShade} />
        </radialGradient>
        {/* En coordenadas de la cabeza: cabeza y párpados comparten exactamente la misma luz. */}
        <radialGradient id={`${uid}-head`} gradientUnits="userSpaceOnUse" cx={260} cy={246} r={290}>
          <stop offset="0%" stopColor={C.furLight} />
          <stop offset="60%" stopColor={C.fur} />
          <stop offset="100%" stopColor={C.furShade} />
        </radialGradient>
        <linearGradient id={`${uid}-tail`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={C.furShade} />
          <stop offset="50%" stopColor={C.fur} />
          <stop offset="100%" stopColor={C.furLight} />
        </linearGradient>
        <radialGradient id={`${uid}-snout`} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFF7E8" />
          <stop offset="70%" stopColor={C.cream} />
          <stop offset="100%" stopColor={C.creamShade} />
        </radialGradient>
      </defs>

      {/* Sombra en el piso */}
      <ellipse
        cx={TITO_FEET.x + c.rootX + c.hipsX * 0.5}
        cy={TITO_FEET.y + 8}
        rx={170 * shadowScale * (1 + (1 - c.stretch) * 0.4)}
        ry={22 * shadowScale}
        fill="#000"
        opacity={0.18 * shadowScale}
      />

      <Tail chain={tail} uid={uid} />
      <Leg leg={sk.legL} side="L" />
      <Leg leg={sk.legR} side="R" />
      <Torso sk={sk} uid={uid} />
      <Arm arm={sk.armL} side="L" uid={uid} />
      <g transform={toSvg(sk.chest)}>
        <ScarfBand />
      </g>
      <g transform={toSvg(sk.head)}>
        <HeadArt uid={uid} c={c} earLAngle={earL} earRAngle={earR} />
      </g>
      <ScarfEnd chain={scarf} knotAngle={sk.chestAngle} />
      <Arm arm={sk.armR} side="R" uid={uid} />

      {showBones && <Bones sk={sk} tail={tail} scarf={scarf} />}
    </svg>
  );
};

const Bones: React.FC<{ sk: ReturnType<typeof solveSkeleton>; tail: Vec[]; scarf: Vec[] }> = ({ sk, tail, scarf }) => {
  const line = (pts: Vec[], color: string) => (
    <polyline points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} fill="none" stroke={color} strokeWidth={4} opacity={0.9} />
  );
  const dots = (pts: Vec[], color: string) => pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={6} fill={color} />);
  return (
    <g>
      {line(sk.spine, "#00C2FF")}
      {line([sk.armL.shoulder, sk.armL.elbow, sk.armL.wrist], "#FF2D9A")}
      {line([sk.armR.shoulder, sk.armR.elbow, sk.armR.wrist], "#FF2D9A")}
      {line([sk.legL.hip, sk.legL.knee, sk.legL.ankle], "#7CFF4D")}
      {line([sk.legR.hip, sk.legR.knee, sk.legR.ankle], "#7CFF4D")}
      {line(tail, "#FFE14D")}
      {line(scarf, "#B48CFF")}
      {dots([...sk.spine, sk.armL.elbow, sk.armR.elbow, sk.legL.knee, sk.legR.knee], "#FFFFFF")}
    </g>
  );
};
