import { clamp, mix, Vec } from "../../rig/math";
import { apply } from "../../rig/matrix";
import { accumulatedPhase, createTrack, Key } from "../../rig/tracks";
import { CHANNEL_NAMES, REST, TitoChannels } from "./channels";
import { blinkAt, blinkSchedule, EXPRESSIONS, ExpressionName, microSaccade, organic, SpeechLine, speechAt } from "./face";
import { createSecondary } from "./secondary";
import type { TitoSecondary } from "./TitoRig";
import { solveSkeleton } from "./skeleton";

/**
 * Una clave de actuación: canales de Tito + controles de capas + expresión.
 * Controles de capas (0..1 salvo que se indique):
 * - idle: cuánto "reposo vivo" se suma (respiración, cambios de peso).
 * - wave: intensidad del saludo con la mano derecha.
 * - lookTarget: cuánto siguen los ojos al objetivo (p. ej. una mariposa).
 * - wagAmt / wagPeriod: amplitud (°) y período (frames) del meneo de cola.
 */
export type ActKey = { f: number; stop?: boolean; expr?: ExpressionName } & Partial<TitoChannels> & {
  idle?: number;
  wave?: number;
  lookTarget?: number;
  wagAmt?: number;
  wagPeriod?: number;
};

export type Jump = { takeoff: number; land: number; height: number; dx?: number };

export type PerformanceSpec = {
  duration: number;
  keys: ActKey[];
  jumps?: Jump[];
  speech?: SpeechLine[];
  /** Parpadeos forzados (giros de cabeza, cambios de emoción). */
  blinks?: number[];
  /** Tramos sin parpadeos automáticos (p. ej. ojos cerrados o en pleno salto). */
  noAutoBlink?: Array<[number, number]>;
  /** Objetivo de la mirada en coordenadas del rig (si hay). */
  lookAt?: (frame: number) => Vec;
  seed?: number;
};

export type Performance = {
  duration: number;
  channelsAt: (frame: number) => TitoChannels;
  secondaryAt: (frame: number) => TitoSecondary;
};

const CONTROLS = { idle: 1, wave: 0, lookTarget: 0, wagAmt: 4, wagPeriod: 46 };

/** Expande las expresiones de las claves en canales de cara. */
const expandKeys = (keys: ActKey[]): Key[] =>
  keys.map(({ expr, ...rest }) => ({ ...(expr ? (EXPRESSIONS[expr] as Record<string, number>) : {}), ...rest }) as Key);

/**
 * Construye la actuación completa de Tito a partir de poses clave + capas:
 *   1. Poses clave (pista con interpolación monótona)
 *   2. Reposo vivo (respiración, peso, micro-movimientos orgánicos)
 *   3. Saltos con trayectoria balística real (gravedad constante)
 *   4. Saludo (oscilación con solapamiento codo → muñeca)
 *   5. Habla (boca por sílabas + cabeceos y cejas en los acentos)
 *   6. Mirada (seguimiento de objetivo + microsacadas) y parpadeos
 * y le agrega la física secundaria (cola, orejas, bufanda).
 */
export const createPerformance = (spec: PerformanceSpec): Performance => {
  const seed = spec.seed ?? 1;
  const track = createTrack([{ f: 0, ...CONTROLS } as Key, ...expandKeys(spec.keys)]);
  const blinks = blinkSchedule(spec.duration, spec.blinks ?? [], seed, spec.noAutoBlink ?? []);
  const ctrlAt = (f: number) => ({ ...CONTROLS, ...track(f) });
  const wagPhase = accumulatedPhase(spec.duration, (f) => ctrlAt(f).wagPeriod);
  const WAVE_PERIOD = 15;

  const channelsAt = (frame: number): TitoChannels => {
    const f = frame;
    const k = track(f);
    const ctl = ctrlAt(f);
    const c: TitoChannels = { ...REST };
    for (const name of CHANNEL_NAMES) if (typeof k[name] === "number") c[name] = k[name];

    // 2) Reposo vivo
    const w = clamp(ctl.idle, 0, 1);
    if (w > 0) {
      const br = (Math.sin((2 * Math.PI * f) / 96) + 1) / 2;
      c.breath += br * w;
      const shift = organic(f, 150, seed + 1);
      c.hipsX += shift * 7 * w;
      c.lean += (-shift * 1.4 + organic(f, 95, seed + 4) * 0.7) * w;
      c.headRot += organic(f, 85, seed + 3) * 2.4 * w;
      c.headY += Math.sin((2 * Math.PI * f) / 96 - 0.9) * 1.6 * w;
      c.armLShoulder += (br * 1.6 + organic(f, 70, seed + 6) * 1.5) * w;
      c.armRShoulder += (br * 1.6 + organic(f, 75, seed + 7) * 1.5) * w;
      c.armLElbow += organic(f, 60, seed + 8) * 3 * w;
      c.armRElbow += organic(f, 64, seed + 9) * 3 * w;
      c.earL += organic(f, 55, seed + 10) * 2 * w;
      c.earR += organic(f, 58, seed + 11) * 2 * w;
    }
    c.tailWag += Math.sin(wagPhase[Math.max(0, Math.floor(f))] ?? 0) * ctl.wagAmt;

    // 3) Saltos: parábola de gravedad constante
    for (const j of spec.jumps ?? []) {
      if (f > j.takeoff && f < j.land) {
        const t = (f - j.takeoff) / (j.land - j.takeoff);
        c.rootY -= 4 * j.height * t * (1 - t);
        c.rootX += (j.dx ?? 0) * t;
      } else if (f >= j.land) c.rootX += j.dx ?? 0;
    }

    // 4) Saludo: el codo guía, la muñeca llega tarde (solapamiento)
    const wv = clamp(ctl.wave, 0, 1);
    if (wv > 0) {
      const ph = (2 * Math.PI * f) / WAVE_PERIOD;
      c.armRElbow += Math.sin(ph) * 17 * wv;
      c.armRWrist += Math.sin(ph - 1.2) * 22 * wv;
      c.armRShoulder += Math.sin(ph + 0.7) * 4 * wv;
      c.lean += Math.sin(ph + 0.3) * 0.8 * wv;
      c.headRot += Math.sin(ph - 0.6) * 1.2 * wv;
    }

    // 5) Habla
    const sp = speechAt(f, spec.speech ?? []);
    if (sp.active > 0) {
      c.mouthOpen = mix(c.mouthOpen, sp.open, sp.active);
      c.mouthWide = mix(c.mouthWide, sp.wide, sp.active * 0.9);
      c.headY += sp.emphasis * 5;
      c.headRot += sp.emphasis * 2;
      c.browLY += sp.emphasis * 0.25;
      c.browRY += sp.emphasis * 0.25;
    }

    // 6) Mirada: seguir un objetivo (persecución suave) o microsacadas
    const lt = clamp(ctl.lookTarget, 0, 1);
    if (lt > 0 && spec.lookAt) {
      const sk = solveSkeleton(c);
      const eyes = apply(sk.head, { x: 300, y: 282 });
      const target = spec.lookAt(f);
      const lx = clamp((target.x - eyes.x) / 260, -1, 1);
      const ly = clamp((target.y - eyes.y) / 260, -1, 1);
      c.lookX = mix(c.lookX, lx, lt);
      c.lookY = mix(c.lookY, ly, lt);
    }
    const ms = microSaccade(f, seed);
    c.lookX += ms.x * (1 - lt);
    c.lookY += ms.y * (1 - lt);
    c.blink = Math.max(c.blink, blinkAt(f, blinks));
    return c;
  };

  return { duration: spec.duration, channelsAt, secondaryAt: createSecondary(channelsAt) };
};
