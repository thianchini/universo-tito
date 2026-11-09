import { add, angleDelta, angleOf, dir, dist, mul, sub, Vec, vec } from "../../rig/math";

/**
 * Definición de una cadena (cola, bufanda): longitudes y ángulos de reposo.
 * relAngles[0] es relativo al ángulo de la base; los demás, al tramo anterior.
 */
export type ChainDef = { lengths: number[]; relAngles: number[] };

const fromPoints = (pts: Vec[], baseAngle: number): ChainDef => {
  const lengths: number[] = [];
  const relAngles: number[] = [];
  let prev = baseAngle;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = angleOf(sub(pts[i + 1], pts[i]));
    lengths.push(dist(pts[i], pts[i + 1]));
    relAngles.push(angleDelta(prev, a));
    prev = a;
  }
  return { lengths, relAngles };
};

/** Línea central de la cola en reposo (coincide con la cola del diseño v2). */
export const TAIL_REST_POINTS: Vec[] = [
  vec(352, 693),
  vec(430, 672),
  vec(492, 618),
  vec(522, 536),
  vec(526, 450),
  vec(506, 366),
  vec(470, 292),
  vec(446, 232),
];
export const TAIL: ChainDef = fromPoints(TAIL_REST_POINTS, 0);

/** Punta de la bufanda: cuelga desde el nudo. */
export const SCARF_REST_POINTS: Vec[] = [vec(330, 506), vec(331, 540), vec(332, 574), vec(333, 608), vec(334, 640)];
export const SCARF: ChainDef = fromPoints(SCARF_REST_POINTS, 0);

/** Orejas: un tramo desde la base hasta la punta (en coordenadas de la cabeza). */
export const EAR_L = { base: vec(200, 205), tip: vec(165, 45) };
export const EAR_R = { base: vec(400, 205), tip: vec(435, 45) };

/**
 * Pose cinemática de una cadena (sin física): sigue los ángulos de reposo,
 * más una curvatura extra por tramo (`curl`).
 */
export const kinematicChain = (def: ChainDef, base: Vec, baseAngle: number, curl = 0): Vec[] => {
  const pts = [base];
  let a = baseAngle;
  for (let i = 0; i < def.lengths.length; i++) {
    a += def.relAngles[i] + (i > 0 ? curl : 0);
    pts.push(add(pts[i], mul(dir(a), def.lengths[i])));
  }
  return pts;
};
