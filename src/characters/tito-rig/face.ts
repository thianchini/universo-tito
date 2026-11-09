import { clamp, fbm1, mix, noise1, smoothstep } from "../../rig/math";
import type { PartialChannels } from "./channels";

/**
 * EXPRESIONES de Tito como combinaciones de controles graduales.
 * Se mezclan entre sí con interpolación, así las emociones cambian como un
 * estado de ánimo y no como un interruptor.
 */
export const EXPRESSIONS = {
  /** Contento y tranquilo (reposo). */
  contento: { smile: 0.6, browLY: 0, browRY: 0, browLTilt: 0, browRTilt: 0, eyeOpenL: 1, eyeOpenR: 1, lowerLidL: 0.12, lowerLidR: 0.12, pupil: 1, mouthOpen: 0, mouthWide: 1, mouthShift: 0, blush: 0.55 },
  /** Alegría abierta: sonrisa grande, mejillas que empujan los ojos. */
  alegre: { smile: 1, browLY: 0.45, browRY: 0.45, browLTilt: 0.15, browRTilt: 0.15, eyeOpenL: 1, eyeOpenR: 1, lowerLidL: 0.3, lowerLidR: 0.3, pupil: 1.08, mouthOpen: 0.38, mouthWide: 1.08, mouthShift: 0, blush: 0.8 },
  /** Risa: ojos cerrados en "^", boca abierta. */
  risa: { smile: 1, browLY: 0.6, browRY: 0.6, browLTilt: 0.3, browRTilt: 0.3, eyeOpenL: 0.05, eyeOpenR: 0.05, lowerLidL: 0.7, lowerLidR: 0.7, pupil: 1, mouthOpen: 0.55, mouthWide: 1.1, mouthShift: 0, blush: 0.9 },
  /** Atento: algo le llamó la atención. */
  atento: { smile: 0.25, browLY: 0.55, browRY: 0.55, browLTilt: 0, browRTilt: 0, eyeOpenL: 1.12, eyeOpenR: 1.12, lowerLidL: 0, lowerLidR: 0, pupil: 0.85, mouthOpen: 0, mouthWide: 0.9, mouthShift: 0, blush: 0.5 },
  /** Curiosidad: una ceja bien alta, otra pensativa, boquita en "o" corrida, pupilas grandes. */
  curioso: { smile: 0.1, browLY: -0.15, browRY: 1, browLTilt: -0.25, browRTilt: 0.1, eyeOpenL: 0.92, eyeOpenR: 1.14, lowerLidL: 0.15, lowerLidR: 0, pupil: 1.12, mouthOpen: 0.16, mouthWide: 0.42, mouthShift: 12, blush: 0.55 },
  /** Asombro / descubrimiento: "¡oh!". */
  asombro: { smile: 0, browLY: 0.9, browRY: 0.9, browLTilt: 0.1, browRTilt: 0.1, eyeOpenL: 1.2, eyeOpenR: 1.2, lowerLidL: 0, lowerLidR: 0, pupil: 1.18, mouthOpen: 0.62, mouthWide: 0.64, mouthShift: 0, blush: 0.65 },
  /** Decidido: cejas bajas hacia adentro, mirada fija, sonrisa de "¡vamos!". */
  decidido: { smile: 0.55, browLY: -0.35, browRY: -0.35, browLTilt: -0.55, browRTilt: -0.55, eyeOpenL: 0.95, eyeOpenR: 0.95, lowerLidL: 0.2, lowerLidR: 0.2, pupil: 0.95, mouthOpen: 0.05, mouthWide: 1, mouthShift: 0, blush: 0.6 },
  /** Ilusión / euforia en el aire. */
  euforia: { smile: 1, browLY: 0.85, browRY: 0.85, browLTilt: 0.2, browRTilt: 0.2, eyeOpenL: 1.1, eyeOpenR: 1.1, lowerLidL: 0.25, lowerLidR: 0.25, pupil: 1.15, mouthOpen: 0.7, mouthWide: 1.05, mouthShift: 0, blush: 0.85 },
} satisfies Record<string, PartialChannels>;

export type ExpressionName = keyof typeof EXPRESSIONS;

/** Mezcla dos expresiones (t 0..1). */
export const blendExpressions = (a: ExpressionName, b: ExpressionName, t: number): PartialChannels => {
  const A = EXPRESSIONS[a] as Record<string, number>;
  const B = EXPRESSIONS[b] as Record<string, number>;
  const out: Record<string, number> = {};
  for (const k of Object.keys(A)) out[k] = mix(A[k], B[k] ?? A[k], t);
  return out as PartialChannels;
};

// ── PARPADEO ─────────────────────────────────────────────────────────

/**
 * Curva de un parpadeo real: cierra rápido (2 frames, acelerando), queda
 * cerrado 1 frame y abre más lento (4 frames, desacelerando).
 */
export const blinkShape = (t: number): number => {
  if (t < 0) return 0;
  if (t < 2) return Math.pow(t / 2, 1.6);
  if (t < 3) return 1;
  if (t < 7) return 1 - smoothstep((t - 3) / 4);
  return 0;
};

/**
 * Agenda de parpadeos naturales: intervalos irregulares (2–4,5 s) con
 * parpadeos dobles ocasionales, más los parpadeos forzados (giros de cabeza,
 * aterrizajes, cambios de emoción).
 */
export const blinkSchedule = (duration: number, forced: number[] = [], seed = 1, suppress: Array<[number, number]> = []): number[] => {
  const out: number[] = [...forced];
  let f = 18 + Math.floor(Math.abs(noise1(seed * 3.1)) * 30);
  let i = 0;
  while (f < duration) {
    const near = forced.some((x) => Math.abs(x - f) < 30);
    const muted = suppress.some(([a, b]) => f >= a && f <= b);
    if (!near && !muted) {
      out.push(f);
      if (Math.abs(noise1(i * 7.7 + seed)) > 0.72) out.push(f + 9); // doble parpadeo
    }
    f += 60 + Math.floor(Math.abs(noise1(i * 3.3 + seed * 1.7)) * 75);
    i++;
  }
  return out.sort((a, b) => a - b);
};

export const blinkAt = (frame: number, schedule: number[]): number =>
  schedule.reduce((m, start) => Math.max(m, blinkShape(frame - start)), 0);

// ── MICRO-MOVIMIENTOS DE LOS OJOS ────────────────────────────────────

/**
 * Microsacadas: los ojos nunca están quietos del todo. Pequeños saltos de
 * mirada que se sostienen y cambian rápido (2 frames), como en las personas.
 */
export const microSaccade = (frame: number, seed = 0): { x: number; y: number } => {
  // Intervalos irregulares (18–40 frames) entre saltitos de mirada.
  let start = 0;
  let idx = 0;
  for (;;) {
    const len = 18 + Math.round(Math.abs(noise1(idx * 0.91 + 3, seed + 31)) * 22);
    if (frame < start + len) break;
    start += len;
    idx++;
  }
  const local = frame - start;
  const target = (k: number) => ({ x: noise1(k * 1.37, seed + 11) * 0.08, y: noise1(k * 2.11, seed + 23) * 0.05 });
  const a = target(idx - 1);
  const b = target(idx);
  const t = smoothstep(local / 2.5);
  return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
};

/** Movimiento orgánico lento (para el peso en reposo, la respiración, etc.). */
export const organic = (frame: number, period: number, seed: number): number => fbm1(frame / period, seed);

// ── HABLA (lip sync a partir del texto) ──────────────────────────────

type Viseme = { open: number; wide: number };
const VOWELS: Record<string, Viseme> = {
  a: { open: 0.75, wide: 1.05 },
  e: { open: 0.48, wide: 1.18 },
  i: { open: 0.3, wide: 1.25 },
  o: { open: 0.6, wide: 0.66 },
  u: { open: 0.36, wide: 0.52 },
};
const LABIALS = new Set(["m", "b", "p"]);

export type SpeechLine = { from: number; durationInFrames: number; text: string };

type Unit = { kind: "syl"; v: Viseme; closeAfter: boolean; stress: boolean } | { kind: "pause"; weight: number };

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[áà]/g, "á")
    .replace(/[éè]/g, "é")
    .replace(/[íì]/g, "í")
    .replace(/[óò]/g, "ó")
    .replace(/[úùü]/g, "ú");

/** Divide el texto en sílabas aproximadas (núcleos vocálicos) y pausas. */
const toUnits = (text: string): Unit[] => {
  const s = normalize(text);
  const units: Unit[] = [];
  const plain = (ch: string) => ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    const p = plain(ch);
    if (VOWELS[p]) {
      // núcleo: vocales seguidas cuentan como una sílaba (diptongo)
      let j = i;
      let accent = false;
      let main = p;
      while (j < s.length && VOWELS[plain(s[j])]) {
        if (s[j] !== plain(s[j])) accent = true;
        if ("aeo".includes(plain(s[j]))) main = plain(s[j]);
        j++;
      }
      const next = plain(s[j] ?? "");
      units.push({ kind: "syl", v: VOWELS[main], closeAfter: LABIALS.has(next), stress: accent });
      i = j;
    } else if (",;".includes(ch)) {
      units.push({ kind: "pause", weight: 1.2 });
      i++;
    } else if (".!?¡¿".includes(ch)) {
      if ("!?.".includes(ch)) units.push({ kind: "pause", weight: 1.6 });
      i++;
    } else {
      i++;
    }
  }
  // La última sílaba antes de cada pausa fuerte lleva énfasis (entonación exclamativa).
  for (let k = 0; k < units.length; k++) {
    const u = units[k];
    const nx = units[k + 1];
    if (u.kind === "syl" && (!nx || nx.kind === "pause")) u.stress = true;
  }
  return units;
};

/**
 * Movimiento de boca y énfasis a partir del texto y su duración.
 * Devuelve apertura, ancho y "énfasis" (para cabeceos y cejas) por frame.
 */
export const speechAt = (frame: number, lines: SpeechLine[]): { open: number; wide: number; emphasis: number; active: number } => {
  for (const line of lines) {
    const local = frame - line.from;
    if (local < -3 || local > line.durationInFrames + 4) continue;
    const units = toUnits(line.text);
    const weights = units.map((u) => (u.kind === "syl" ? (u.stress ? 1.35 : 1) : u.weight));
    // Las pausas finales no ocupan tiempo de habla.
    while (units.length && units[units.length - 1].kind === "pause") {
      units.pop();
      weights.pop();
    }
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    const scale = line.durationInFrames / total;
    let t0 = 0;
    let open = 0;
    let wide = 1;
    let emphasis = 0;
    for (let k = 0; k < units.length; k++) {
      const u = units[k];
      const len = weights[k] * scale;
      const x = (local - t0) / len;
      if (u.kind === "syl" && x > -0.6 && x < 1.4) {
        // Envolvente: abre rápido, sostiene, cierra hacia la consonante siguiente.
        const env = clamp(Math.sin(Math.PI * clamp((x + 0.15) / 1.15, 0, 1)), 0, 1);
        const shaped = Math.pow(env, 0.8) * (u.stress ? 1.12 : 1);
        if (shaped * u.v.open > open) {
          open = shaped * u.v.open * (u.closeAfter && x > 0.7 ? 0.4 : 1);
          wide = mix(1, u.v.wide, clamp(shaped * 1.2, 0, 1));
        }
        if (u.stress) emphasis = Math.max(emphasis, Math.sin(Math.PI * clamp(x, 0, 1)));
      }
      t0 += len;
    }
    const active = clamp(Math.min(local + 3, line.durationInFrames + 4 - local) / 4, 0, 1);
    return { open: open * active, wide: mix(1, wide, active), emphasis: emphasis * active, active };
  }
  return { open: 0, wide: 1, emphasis: 0, active: 0 };
};
