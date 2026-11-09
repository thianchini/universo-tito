import type { Vec } from "./math";

/** Matriz afín 2D [a c e; b d f] (mismo formato que SVG `matrix(a b c d e f)`). */
export type Mat = { a: number; b: number; c: number; d: number; e: number; f: number };

export const IDENTITY: Mat = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

export const multiply = (m: Mat, n: Mat): Mat => ({
  a: m.a * n.a + m.c * n.b,
  b: m.b * n.a + m.d * n.b,
  c: m.a * n.c + m.c * n.d,
  d: m.b * n.c + m.d * n.d,
  e: m.a * n.e + m.c * n.f + m.e,
  f: m.b * n.e + m.d * n.f + m.f,
});

export const translate = (x: number, y: number): Mat => ({ a: 1, b: 0, c: 0, d: 1, e: x, f: y });
export const scaleM = (sx: number, sy: number): Mat => ({ a: sx, b: 0, c: 0, d: sy, e: 0, f: 0 });
export const rotateM = (deg: number): Mat => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { a: c, b: s, c: -s, d: c, e: 0, f: 0 };
};

/** Compone transformaciones en el orden en que se leen (como el atributo SVG transform). */
export const compose = (...ms: Mat[]): Mat => ms.reduce((acc, m) => multiply(acc, m), IDENTITY);

export const apply = (m: Mat, p: Vec): Vec => ({ x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f });

export const toSvg = (m: Mat): string =>
  `matrix(${m.a.toFixed(5)} ${m.b.toFixed(5)} ${m.c.toFixed(5)} ${m.d.toFixed(5)} ${m.e.toFixed(3)} ${m.f.toFixed(3)})`;

/** Rotación de `deg` alrededor del punto (x, y). */
export const rotateAbout = (deg: number, x: number, y: number): Mat => compose(translate(x, y), rotateM(deg), translate(-x, -y));
/** Escala alrededor del punto (x, y). */
export const scaleAbout = (sx: number, sy: number, x: number, y: number): Mat =>
  compose(translate(x, y), scaleM(sx, sy), translate(-x, -y));
