/**
 * PISTAS DE POSES CLAVE (como la línea de tiempo de un animador).
 *
 * Cada clave fija algunos canales en un frame. Entre claves se interpola con
 * una cúbica MONÓTONA (Fritsch–Carlson):
 * - la velocidad es continua al atravesar poses intermedias (no hay el
 *   "frena-arranca" robótico de poner ease-in/out en cada clave),
 * - nunca se pasa de los valores indicados (los rebotes se animan a propósito),
 * - en los extremos (máximos/mínimos) la velocidad es 0: llega y vuelve suave.
 * `stop: true` fuerza velocidad 0 en esa clave (una pausa real, "hold").
 */
export type Key = { f: number; stop?: boolean } & Record<string, number | boolean | undefined>;

type Curve = { xs: number[]; ys: number[]; ms: number[] };

const buildCurve = (pts: Array<{ x: number; y: number; stop: boolean }>): Curve => {
  const n = pts.length;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / Math.max(1e-6, xs[i + 1] - xs[i]));
  const ms: number[] = new Array(n).fill(0);
  if (n > 1) {
    ms[0] = 0;
    ms[n - 1] = 0;
    for (let i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) ms[i] = 0;
      else {
        // media armónica ponderada (Fritsch–Butland): monótona y suave
        const w1 = 2 * (xs[i + 1] - xs[i]) + (xs[i] - xs[i - 1]);
        const w2 = (xs[i + 1] - xs[i]) + 2 * (xs[i] - xs[i - 1]);
        ms[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
      }
    }
    pts.forEach((p, i) => {
      if (p.stop) ms[i] = 0;
    });
  }
  return { xs, ys, ms };
};

const evalCurve = (c: Curve, x: number): number => {
  const { xs, ys, ms } = c;
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let i = 0;
  while (i < n - 2 && x > xs[i + 1]) i++;
  const h = xs[i + 1] - xs[i];
  const t = (x - xs[i]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * ms[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * ms[i + 1];
};

/** Crea una pista: devuelve, para un frame, los valores de todos los canales animados. */
export const createTrack = (keys: Key[]): ((frame: number) => Record<string, number>) => {
  const sorted = [...keys].sort((a, b) => a.f - b.f);
  const names = new Set<string>();
  for (const k of sorted) for (const name of Object.keys(k)) if (name !== "f" && name !== "stop" && typeof k[name] === "number") names.add(name);
  const curves = new Map<string, Curve>();
  for (const name of names) {
    const pts = sorted.filter((k) => typeof k[name] === "number").map((k) => ({ x: k.f, y: k[name] as number, stop: Boolean(k.stop) }));
    curves.set(name, buildCurve(pts));
  }
  return (frame: number) => {
    const out: Record<string, number> = {};
    for (const [name, c] of curves) out[name] = evalCurve(c, frame);
    return out;
  };
};

/**
 * Fase acumulada de una oscilación cuyo período puede cambiar con el tiempo
 * (p. ej. la cola mueve más rápido cuando Tito se entusiasma) sin saltos.
 */
export const accumulatedPhase = (duration: number, periodAt: (frame: number) => number): number[] => {
  const out: number[] = [0];
  for (let f = 1; f <= duration + 1; f++) out.push(out[f - 1] + (2 * Math.PI) / Math.max(1, periodAt(f)));
  return out;
};
