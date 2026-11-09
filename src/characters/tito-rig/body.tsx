import React from "react";
import { furPath, sampleSpline, smoothPath, tubeSides } from "../../rig/curves";
import { add, mix, mul, norm, perpRight, sub, Vec } from "../../rig/math";
import { TITO_COLORS as C } from "../tito/design";
import { ArmPose, BONES, LegPose, Skeleton, spineAt } from "./skeleton";

const OUTLINE = 5;

/** Interpola linealmente una tabla [u, valor] ordenada por u. */
const profile = (table: ReadonlyArray<readonly [number, number]>, u: number): number => {
  if (u <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (u <= table[i][0]) {
      const [u0, v0] = table[i - 1];
      const [u1, v1] = table[i];
      return mix(v0, v1, (u - u0) / (u1 - u0));
    }
  }
  return table[table.length - 1][1];
};

/** Medio ancho del torso a lo largo de la columna (u = 0 pelvis, 1 cuello). */
const TORSO: ReadonlyArray<readonly [number, number]> = [
  [-0.15, 0],
  [-0.147, 26],
  [-0.138, 48],
  [-0.12, 66],
  [-0.09, 84],
  [-0.05, 97],
  [0.02, 107],
  [0.15, 114],
  [0.3, 117],
  [0.45, 115],
  [0.6, 109],
  [0.72, 101],
  [0.82, 89],
  [0.9, 73],
  [0.96, 56],
  [1.0, 44],
];
const BELLY: ReadonlyArray<readonly [number, number]> = [
  [-0.05, 0],
  [-0.047, 18],
  [-0.035, 34],
  [-0.01, 46],
  [0.06, 54],
  [0.3, 58],
  [0.55, 56],
  [0.7, 50],
  [0.8, 38],
  [0.85, 22],
  [0.87, 0],
];

/** Contorno cerrado de una forma que sigue a la columna (se dobla y se estira con ella). */
const spineShape = (sk: Skeleton, table: ReadonlyArray<readonly [number, number]>, breathAmt: number): string => {
  const u0 = table[0][0];
  const u1 = table[table.length - 1][0];
  const steps = 34;
  const w = 1 / Math.sqrt(sk.stretch);
  const right: Vec[] = [];
  const left: Vec[] = [];
  for (let i = 0; i <= steps; i++) {
    // Muestreo más denso en las puntas para que queden redondeadas.
    const u = u0 + ((u1 - u0) * (1 - Math.cos((Math.PI * i) / steps))) / 2;
    const { p, t } = spineAt(sk, u);
    // La respiración ensancha el pecho (más arriba que abajo).
    const breath = 1 + sk.breath * breathAmt * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.2) / 0.75))));
    const hw = profile(table, u) * w * breath;
    const n = perpRight(t);
    right.push(add(p, mul(n, hw)));
    left.push(add(p, mul(n, -hw)));
  }
  // Las puntas (ancho 0) son un único punto compartido.
  const pts = [...right.slice(0, -1), ...left.reverse().slice(0, -1)];
  return smoothPath(pts, true);
};

export const Torso: React.FC<{ sk: Skeleton; uid: string }> = ({ sk, uid }) => (
  <g>
    <path d={spineShape(sk, TORSO, 0.035)} fill={`url(#${uid}-fur)`} stroke={C.outline} strokeWidth={OUTLINE} strokeLinejoin="round" />
    <path d={spineShape(sk, BELLY, 0.05)} fill={C.cream} />
  </g>
);

// ── Brazos ───────────────────────────────────────────────────────────

const armCenter = (a: ArmPose): Vec[] => sampleSpline([a.shoulder, a.elbow, a.wrist], 7);

/**
 * Brazo como un único tubo continuo (sin piezas ni costuras): el codo es una
 * curva suave. El contorno se dibuja sólo por los costados para que el hombro
 * se funda con el cuerpo.
 */
export const Arm: React.FC<{ arm: ArmPose; side: "L" | "R"; uid: string }> = ({ arm, side, uid }) => {
  const center = armCenter(arm);
  const n = center.length;
  const { right, left } = tubeSides(center, (_, t) => mix(22, 18, t) + Math.sin(Math.PI * t) * 1.5);
  // Tapa redondeada en el hombro (de borde izquierdo a borde derecho, por detrás).
  const capR = 22;
  const back = norm(sub(center[0], center[2]));
  const side90 = perpRight(back);
  const cap: Vec[] = [];
  for (let k = 1; k < 6; k++) {
    const a = ((90 - (180 * k) / 6) * Math.PI) / 180;
    cap.push(add(center[0], add(mul(back, Math.cos(a) * capR), mul(side90, Math.sin(a) * capR))));
  }
  const fill = smoothPath([...right, ...left.slice().reverse(), ...cap], true);
  const from = Math.round(n * 0.22);
  const sideR = smoothPath(right.slice(from), false);
  const sideL = smoothPath(left.slice(from), false);
  // Sombra interna que acompaña la curva del brazo.
  const s = side === "R" ? -1 : 1;
  const inner = tubeSides(center, () => 10 * s).right.slice(Math.round(n * 0.45), n - 2);
  return (
    <g>
      <path d={fill} fill={`url(#${uid}-fur)`} />
      <path d={sideR} fill="none" stroke={C.outline} strokeWidth={OUTLINE} strokeLinecap="round" />
      <path d={sideL} fill="none" stroke={C.outline} strokeWidth={OUTLINE} strokeLinecap="round" />
      {inner.length > 1 && <path d={smoothPath(inner, false)} fill="none" stroke={C.furShade} strokeWidth={4} strokeLinecap="round" opacity={0.45} />}
      <Hand at={arm.wrist} angle={arm.handAngle} side={side} />
    </g>
  );
};

const Hand: React.FC<{ at: Vec; angle: number; side: "L" | "R" }> = ({ at, angle, side }) => {
  const mirror = side === "L" ? -1 : 1;
  return (
    <g transform={`translate(${at.x.toFixed(2)} ${at.y.toFixed(2)}) rotate(${(angle - 180).toFixed(2)}) scale(${mirror} 1)`}>
      {/* pulgar (hacia el cuerpo) */}
      <ellipse cx={-19} cy={4} rx={10} ry={12} fill={C.paws} stroke={C.outline} strokeWidth={4} transform="rotate(-20 -19 4)" />
      <ellipse cx={0} cy={12} rx={24} ry={22} fill={C.paws} stroke={C.outline} strokeWidth={OUTLINE} />
      <path d="M -7 22 L -7 31 M 6 22 L 6 31" stroke="#4A2612" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={5} cy={4} rx={8} ry={5} fill="#FFFFFF" opacity={0.18} />
    </g>
  );
};

// ── Piernas ──────────────────────────────────────────────────────────

export const Leg: React.FC<{ leg: LegPose; side: "L" | "R" }> = ({ leg, side }) => {
  const center = sampleSpline([leg.hip, leg.knee, leg.ankle], 6);
  const { right, left } = tubeSides(center, (_, t) => mix(31, 28, t));
  const fill = smoothPath([...right, ...left.slice().reverse()], true);
  const out = side === "L" ? -1 : 1;
  const foot = add(leg.ankle, { x: 3 * out, y: 7 });
  return (
    <g>
      <path d={fill} fill={C.paws} stroke={C.outline} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <g transform={`translate(${foot.x.toFixed(2)} ${foot.y.toFixed(2)}) rotate(${(leg.footAngle * out).toFixed(2)})`}>
        <path d="M -38 4 C -38 -14 -24 -20 0 -20 C 24 -20 38 -14 38 4 C 38 16 26 18 0 18 C -26 18 -38 16 -38 4 Z" fill={C.paws} stroke={C.outline} strokeWidth={OUTLINE} />
        <path d="M -14 8 L -14 16 M 0 8 L 0 17 M 14 8 L 14 16" stroke="#4A2612" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      </g>
    </g>
  );
};

// ── Cola ─────────────────────────────────────────────────────────────

/** Radio de la cola según la posición a lo largo (0 base, 1 punta). */
const tailRadius = (t: number) => {
  const table: Array<[number, number]> = [
    [0, 24],
    [0.1, 62],
    [0.25, 90],
    [0.42, 100],
    [0.6, 96],
    [0.75, 82],
    [0.88, 58],
    [1, 14],
  ];
  return profile(table, t);
};

const TIP_START = 0.66;

/** Cola esponjosa a partir de la cadena de puntos (que mueve la física). */
export const Tail: React.FC<{ chain: Vec[]; uid: string }> = ({ chain, uid }) => {
  const center = sampleSpline(chain, 4);
  const n = center.length;
  const { right, left } = tubeSides(center, (_, t) => tailRadius(t));
  // Contorno peludo: lado izquierdo de base a punta, punta, lado derecho de vuelta.
  // (sentido antihorario en pantalla para que los mechones apunten afuera)
  const tip = center[n - 1];
  // Un mechón cada 3 muestras (más grandes y redondeados, como en el diseño).
  const every = <T,>(arr: T[], k: number) => arr.filter((_, i) => i % k === 0 || i === arr.length - 1);
  const outline = [...every(left, 3), tip, ...every(right, 3).reverse()];
  // Mechones redondeados: el abombado es proporcional al largo de cada tramo.
  const furOf = (pts: Vec[]) => (i: number) => {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    // Negativo: este contorno se recorre en sentido horario.
    return -Math.hypot(b.x - a.x, b.y - a.y) * (i % 2 === 0 ? 0.36 : 0.28);
  };
  const fur = furOf(outline);
  const outlinePath = furPath(outline, fur);

  // Punta crema con borde en zigzag.
  const k0 = Math.floor((n - 1) * TIP_START);
  const zig: Vec[] = [];
  const steps = 6;
  for (let s = 1; s < steps; s++) {
    const a = s / steps;
    const p = add(mul(right[k0], a), mul(left[k0], 1 - a));
    const shift = (s % 2 === 0 ? 1 : -1) * 0.05;
    const kk = Math.min(n - 1, Math.max(0, Math.round((TIP_START + shift) * (n - 1))));
    const q = add(mul(right[kk], a), mul(left[kk], 1 - a));
    zig.push(s % 2 === 0 ? p : q);
  }
  const tipPts = [...every(left.slice(k0), 3), tip, ...every(right.slice(k0), 3).reverse(), ...zig.reverse()];
  const tipFur = furOf(tipPts);
  const tipPath = furPath(tipPts, (i) => (i < tipPts.length - zig.length - 1 ? tipFur(i) : 2));

  // Mechones interiores que siguen la curva de la cola.
  const strand = (t0: number, t1: number, off: number) => {
    const a = Math.round(t0 * (n - 1));
    const b = Math.round(t1 * (n - 1));
    const pts = tubeSides(center.slice(a, b + 1), (i) => tailRadius((a + i) / (n - 1)) * off).right;
    return smoothPath(pts, false);
  };

  return (
    <g>
      <path d={outlinePath} fill={`url(#${uid}-tail)`} />
      <path d={tipPath} fill={C.cream} />
      <g fill="none" strokeLinecap="round">
        <path d={strand(0.12, 0.5, 0.45)} stroke={C.furShade} strokeWidth={7} opacity={0.5} />
        <path d={strand(0.25, 0.58, -0.35)} stroke={C.furLight} strokeWidth={6} opacity={0.7} />
        <path d={strand(0.35, 0.62, 0.7)} stroke={C.furShade} strokeWidth={5} opacity={0.4} />
        <path d={strand(0.74, 0.92, 0.35)} stroke={C.creamShade} strokeWidth={6} />
        <path d={strand(0.8, 0.95, -0.3)} stroke={C.creamShade} strokeWidth={5} />
      </g>
      <path d={outlinePath} fill="none" stroke={C.outline} strokeWidth={OUTLINE} strokeLinejoin="round" />
    </g>
  );
};

// ── Bufanda ──────────────────────────────────────────────────────────

const bandTop = (x: number) => {
  const t = (x - 178) / 244;
  return 452 + 3 * t * (1 - t) * 46;
};
const bandBottom = (x: number) => {
  const t = (x - 172) / 256;
  return 488 + 3 * t * (1 - t) * 52;
};

/** Banda de la bufanda (se dibuja en coordenadas originales, con la matriz del pecho). */
export const ScarfBand: React.FC = () => (
  <g>
    <path d="M 178 452 C 225 498 375 498 422 452 L 428 488 C 380 540 220 540 172 488 Z" fill={C.scarf} stroke={C.outline} strokeWidth={OUTLINE} strokeLinejoin="round" />
    {[200, 222, 244, 266, 288, 310, 332, 354, 376, 398].map((x) => (
      <path key={x} d={`M ${x} ${bandTop(x) + 7} L ${x} ${bandBottom(x) - 7}`} stroke={C.scarfShade} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
    ))}
    <path d="M 182 471 C 228 519 372 519 418 471" stroke={C.scarfStripe} strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

/** Punta de la bufanda como cinta de tela que sigue la cadena física. */
export const ScarfEnd: React.FC<{ chain: Vec[]; knotAngle: number }> = ({ chain, knotAngle }) => {
  const center = sampleSpline(chain, 5);
  const n = center.length;
  const { right, left } = tubeSides(center, (_, t) => mix(23, 28, t));
  const body = smoothPath([...right, ...left.slice().reverse()], true);
  const at = (t: number) => Math.min(n - 1, Math.round(t * (n - 1)));
  const stripe = (t: number) => {
    const i = at(t);
    return `M ${right[i].x.toFixed(1)} ${right[i].y.toFixed(1)} L ${left[i].x.toFixed(1)} ${left[i].y.toFixed(1)}`;
  };
  // Flecos: salen del borde inferior en la dirección del último tramo.
  const last = center[n - 1];
  const prev = center[n - 3];
  const dx = last.x - prev.x;
  const dy = last.y - prev.y;
  const l = Math.hypot(dx, dy) || 1;
  const d = { x: dx / l, y: dy / l };
  const fringe = [0.12, 0.37, 0.63, 0.88]
    .map((a) => {
      const p = add(mul(right[n - 1], a), mul(left[n - 1], 1 - a));
      const q = add(p, mul(d, 22));
      return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} L ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    })
    .join(" ");
  const knot = chain[0];
  return (
    <g>
      <path d={fringe} stroke={C.scarfShade} strokeWidth={7} strokeLinecap="round" />
      <path d={body} fill={C.scarf} stroke={C.outline} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={`${stripe(0.6)} ${stripe(0.72)}`} stroke={C.scarfStripe} strokeWidth={9} />
      <path d={smoothPath(center.slice(at(0.1), at(0.95)), false)} stroke={C.scarfShade} strokeWidth={4} fill="none" opacity={0.45} />
      <g transform={`translate(${knot.x.toFixed(2)} ${knot.y.toFixed(2)}) rotate(${knotAngle.toFixed(2)})`}>
        <ellipse cx={0} cy={0} rx={30} ry={22} fill={C.scarf} stroke={C.outline} strokeWidth={OUTLINE} />
        <path d="M -18 -2 Q 0 10 18 -2" stroke={C.scarfShade} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

export { BONES };
