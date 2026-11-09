/**
 * Matemática 2D del motor de animación.
 * Convención de ángulos (grados): 0 = hacia arriba, positivo = sentido horario
 * en pantalla (hacia +x). Así 90 = derecha, 180 = abajo, 270/-90 = izquierda.
 */
export type Vec = { x: number; y: number };

export const vec = (x: number, y: number): Vec => ({ x, y });
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Vec, s: number): Vec => ({ x: a.x * s, y: a.y * s });
export const len = (a: Vec): number => Math.hypot(a.x, a.y);
export const dist = (a: Vec, b: Vec): number => Math.hypot(a.x - b.x, a.y - b.y);
export const norm = (a: Vec): Vec => {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
};
/** Perpendicular "a la derecha" de una dirección (para una dirección hacia arriba, apunta a +x). */
export const perpRight = (a: Vec): Vec => ({ x: -a.y, y: a.x });
export const lerpVec = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

const RAD = Math.PI / 180;
export const toRad = (deg: number) => deg * RAD;
export const toDeg = (rad: number) => rad / RAD;

/** Vector unitario en la dirección `deg` (0 = arriba, horario). */
export const dir = (deg: number): Vec => ({ x: Math.sin(deg * RAD), y: -Math.cos(deg * RAD) });
/** Ángulo (convención del motor) de un vector. */
export const angleOf = (a: Vec): number => toDeg(Math.atan2(a.x, -a.y));
/** Rota un vector `deg` grados (horario). */
export const rotate = (a: Vec, deg: number): Vec => {
  const c = Math.cos(deg * RAD);
  const s = Math.sin(deg * RAD);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
};
/** Rota el punto `p` alrededor de `o`. */
export const rotateAround = (p: Vec, o: Vec, deg: number): Vec => add(o, rotate(sub(p, o), deg));
/** Diferencia angular más corta b - a, en (-180, 180]. */
export const angleDelta = (a: number, b: number): number => {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
};

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
/** Lleva v de [a,b] a [0,1] (sin recortar). */
export const inverseLerp = (a: number, b: number, v: number) => (b === a ? 0 : (v - a) / (b - a));

/**
 * Ruido suave 1D determinista (value noise con interpolación cúbica), en [-1, 1].
 * Sirve para movimientos orgánicos que no se repiten de forma mecánica.
 */
export const noise1 = (t: number, seed = 0): number => {
  const hash = (n: number) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  return mix(hash(i), hash(i + 1), u);
};

/** Ruido fractal (dos octavas) para variaciones aún más naturales. */
export const fbm1 = (t: number, seed = 0): number => noise1(t, seed) * 0.7 + noise1(t * 2.13 + 17.3, seed + 5) * 0.3;
