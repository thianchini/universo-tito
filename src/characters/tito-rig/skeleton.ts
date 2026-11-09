import { solveTwoBone } from "../../rig/ik";
import { add, angleOf, dir, mul, norm, perpRight, sub, Vec, vec } from "../../rig/math";
import { compose, Mat, rotateAbout, scaleAbout, translate } from "../../rig/matrix";
import type { TitoChannels } from "./channels";

/** Medidas del esqueleto en reposo (unidades del lienzo 600×820). */
export const BONES = {
  pelvis: vec(300, 705),
  spineLength: 235,
  /** Punto de la cabeza que se apoya en el cuello (en coordenadas de dibujo de la cabeza). */
  headPivot: vec(300, 470),
  shoulderU: 0.8,
  shoulderOffset: 80,
  armRestOut: 6,
  upperArm: 66,
  forearm: 60,
  hipU: -0.02,
  hipOffset: 40,
  thigh: 34,
  shin: 34,
  ankleL: vec(262, 766),
  ankleR: vec(338, 766),
  /** Base de la cola respecto de la pelvis. */
  tailBase: vec(52, -12),
  /** Nudo de la bufanda respecto del cuello. */
  scarfKnot: vec(30, 36),
} as const;

export type ArmPose = { shoulder: Vec; elbow: Vec; wrist: Vec; handAngle: number };
export type LegPose = { hip: Vec; knee: Vec; ankle: Vec; footAngle: number };

export type Skeleton = {
  /** Puntos de control de la columna (Bézier cuadrática): pelvis → pecho → cuello. */
  spine: [Vec, Vec, Vec];
  stretch: number;
  breath: number;
  neck: Vec;
  /** Ángulo de la columna en el cuello (0 = vertical). */
  chestAngle: number;
  pelvisAngle: number;
  /** Matriz que lleva el dibujo de la cabeza (coordenadas originales) a su lugar. */
  head: Mat;
  headAngle: number;
  /** Matriz del pecho (bufanda), con origen en el dibujo original. */
  chest: Mat;
  armL: ArmPose;
  armR: ArmPose;
  legL: LegPose;
  legR: LegPose;
  tailBase: Vec;
  tailBaseAngle: number;
  scarfKnot: Vec;
  root: Vec;
};

/** Punto y tangente de la columna para el parámetro u (puede ser <0: se extrapola). */
export const spineAt = (sk: Pick<Skeleton, "spine">, u: number): { p: Vec; t: Vec } => {
  const [p0, p1, p2] = sk.spine;
  if (u < 0) {
    const t0 = norm(sub(p1, p0));
    return { p: add(p0, mul(t0, u * 2 * Math.hypot(p1.x - p0.x, p1.y - p0.y))), t: t0 };
  }
  const v = Math.min(1, u);
  const a = (1 - v) * (1 - v);
  const b = 2 * (1 - v) * v;
  const c = v * v;
  const p = { x: a * p0.x + b * p1.x + c * p2.x, y: a * p0.y + b * p1.y + c * p2.y };
  const d = { x: 2 * (1 - v) * (p1.x - p0.x) + 2 * v * (p2.x - p1.x), y: 2 * (1 - v) * (p1.y - p0.y) + 2 * v * (p2.y - p1.y) };
  return { p, t: norm(d) };
};

const solveArm = (side: "L" | "R", c: TitoChannels, shoulder: Vec, chestAngle: number): ArmPose => {
  const right = side === "R";
  const sh = right ? c.armRShoulder : c.armLShoulder;
  const el = right ? c.armRElbow : c.armLElbow;
  const wr = right ? c.armRWrist : c.armLWrist;
  const s = right ? 1 : -1;
  // Colgando = chestAngle + 180; "levantar hacia afuera" gira hacia el lado del brazo.
  const upperDir = chestAngle + 180 - s * (BONES.armRestOut + sh);
  const foreDir = upperDir + s * el;
  const elbow = add(shoulder, mul(dir(upperDir), BONES.upperArm));
  const wrist = add(elbow, mul(dir(foreDir), BONES.forearm));
  return { shoulder, elbow, wrist, handAngle: foreDir + s * wr };
};

/**
 * Resuelve el esqueleto completo a partir de los canales.
 * Todo queda en coordenadas del lienzo de Tito, incluido el desplazamiento de la raíz.
 */
export const solveSkeleton = (c: TitoChannels): Skeleton => {
  const root = vec(c.rootX, c.rootY);
  const s = c.stretch;
  const L = BONES.spineLength * s;
  const pelvis = add(add(BONES.pelvis, vec(c.hipsX, c.hipsY)), root);
  const p1 = add(pelvis, mul(dir(c.lean), L / 2));
  const p2 = add(p1, mul(dir(c.lean + c.bend), L / 2));
  const spine: [Vec, Vec, Vec] = [pelvis, p1, p2];
  const neck = p2;
  const chestAngle = c.lean + c.bend;
  const sk0 = { spine };

  // Hombros sobre la columna, a los costados.
  const widthScale = 1 / Math.sqrt(s);
  const sh = spineAt(sk0, BONES.shoulderU);
  const shN = perpRight(sh.t);
  const shoulderR = add(sh.p, mul(shN, BONES.shoulderOffset * widthScale));
  const shoulderL = add(sh.p, mul(shN, -BONES.shoulderOffset * widthScale));

  // Caderas y piernas (IK: los pies se quedan donde se los pone).
  const hp = spineAt(sk0, BONES.hipU);
  const hpN = perpRight(hp.t);
  const hipR = add(hp.p, mul(hpN, BONES.hipOffset * widthScale));
  const hipL = add(hp.p, mul(hpN, -BONES.hipOffset * widthScale));
  const ankleR = add(add(BONES.ankleR, vec(c.footRX, c.footRY)), root);
  const ankleL = add(add(BONES.ankleL, vec(c.footLX, c.footLY)), root);
  // Rodillas hacia afuera (vista de frente).
  const legR = solveTwoBone(hipR, ankleR, BONES.thigh, BONES.shin, -1);
  const legL = solveTwoBone(hipL, ankleL, BONES.thigh, BONES.shin, 1);

  // Cabeza: sigue al pecho a medias (el cuello absorbe parte) + su propio giro.
  const headAngle = chestAngle * 0.6 + c.headRot;
  const hs = c.headStretch;
  const hp0 = BONES.headPivot;
  const head = compose(
    translate(neck.x + c.headX - hp0.x, neck.y + c.headY - hp0.y),
    rotateAbout(headAngle, hp0.x, hp0.y),
    scaleAbout(1 / Math.sqrt(hs), hs, hp0.x, hp0.y),
  );
  const chest = compose(translate(neck.x - hp0.x, neck.y - hp0.y), rotateAbout(chestAngle, hp0.x, hp0.y), scaleAbout(widthScale, 1, hp0.x, hp0.y));

  const pelvisAngle = c.lean;
  const tailBase = add(pelvis, rotateVec(BONES.tailBase, pelvisAngle));
  const scarfKnot = add(neck, rotateVec(BONES.scarfKnot, chestAngle));

  return {
    spine,
    stretch: s,
    breath: c.breath,
    neck,
    chestAngle,
    pelvisAngle,
    head,
    headAngle,
    chest,
    armL: solveArm("L", c, shoulderL, chestAngle),
    armR: solveArm("R", c, shoulderR, chestAngle),
    legL: { hip: hipL, knee: legL.joint, ankle: legL.end, footAngle: c.footLRot },
    legR: { hip: hipR, knee: legR.joint, ankle: legR.end, footAngle: c.footRRot },
    tailBase,
    tailBaseAngle: pelvisAngle + c.tailWag,
    scarfKnot,
    root,
  };
};

const rotateVec = (v: Vec, deg: number): Vec => {
  const r = (deg * Math.PI) / 180;
  return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) };
};

export { angleOf };
