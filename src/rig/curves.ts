import { add, mul, norm, perpRight, sub, Vec } from "./math";

const f = (n: number) => n.toFixed(2);

/** Punto de una spline Catmull-Rom (centrípeta simplificada, uniforme) entre p1 y p2. */
export const catmull = (p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec => {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
};

/** Muestrea una curva suave abierta que pasa por todos los puntos. */
export const sampleSpline = (pts: Vec[], samplesPerSegment: number): Vec[] => {
  const out: Vec[] = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    for (let s = 0; s < samplesPerSegment; s++) out.push(catmull(p0, p1, p2, p3, s / samplesPerSegment));
  }
  out.push(pts[n - 1]);
  return out;
};

/**
 * Convierte una lista de puntos en un path SVG suave (Catmull-Rom → Bézier cúbicas).
 * `tension` 1 = estándar; menor = más tenso.
 */
export const smoothPath = (pts: Vec[], closed: boolean, tension = 1): string => {
  const n = pts.length;
  if (n < 2) return "";
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const k = tension / 6;
    const c1 = { x: p1.x + (p2.x - p0.x) * k, y: p1.y + (p2.y - p0.y) * k };
    const c2 = { x: p2.x - (p3.x - p1.x) * k, y: p2.y - (p3.y - p1.y) * k };
    d += ` C ${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return closed ? `${d} Z` : d;
};

/**
 * Contorno "peludo": une puntos con curvas que se abomban hacia afuera formando
 * mechones (las uniones quedan en puntita). Los puntos van en sentido
 * antihorario en pantalla; `bulge` es cuánto se abomba cada tramo.
 */
export const furPath = (pts: Vec[], bulge: number | ((i: number) => number), closed = true): string => {
  const n = pts.length;
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const k = typeof bulge === "number" ? bulge : bulge(i);
    const cx = (a.x + b.x) / 2 - (dy / l) * k;
    const cy = (a.y + b.y) / 2 + (dx / l) * k;
    d += ` Q ${f(cx)} ${f(cy)} ${f(b.x)} ${f(b.y)}`;
  }
  return closed ? `${d} Z` : d;
};

/** Tangentes unitarias de una polilínea (diferencias centradas). */
export const tangents = (pts: Vec[]): Vec[] =>
  pts.map((_, i) => norm(sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)])));

/**
 * "Tubo": dada una línea central y un radio por punto, devuelve los dos bordes.
 * `right` es el borde a la derecha del sentido de avance.
 */
export const tubeSides = (center: Vec[], radius: (i: number, t: number) => number): { right: Vec[]; left: Vec[] } => {
  const tg = tangents(center);
  const right: Vec[] = [];
  const left: Vec[] = [];
  const n = center.length;
  center.forEach((p, i) => {
    const r = radius(i, n > 1 ? i / (n - 1) : 0);
    const nrm = perpRight(tg[i]);
    right.push(add(p, mul(nrm, r)));
    left.push(add(p, mul(nrm, -r)));
  });
  return { right, left };
};
