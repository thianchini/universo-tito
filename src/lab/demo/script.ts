import { ActKey, createPerformance } from "../../characters/tito-rig/performance";
import { noise1 } from "../../rig/math";
import { createTrack } from "../../rig/tracks";

/**
 * DEMO DE ANIMACIÓN (10 s · 300 frames)
 *
 *   0–38   Reposo vivo: respira, cambia el peso, parpadea.
 *  38–62   Atención: aparece una mariposa → los ojos saltan primero, la cabeza
 *          los sigue, las orejas se paran.
 *  62–106  Curiosidad: se inclina hacia ella, ladea la cabeza, una ceja arriba,
 *          pata en el pecho, la sigue con la mirada.
 * 106–124  Descubrimiento: "¡oh!" → se ilusiona y se decide.
 * 124–140  Anticipación: se agacha, brazos atrás, cuerpo aplastado.
 * 140–168  Salto: impulso estirado, vuelo con gravedad real, casi la alcanza.
 * 168–192  Aterrizaje: aplasta, rebota y se asienta riéndose.
 * 186–206  Mira a cámara: los ojos primero, después la cabeza.
 * 202–282  Saluda y habla: "¡Hola! ¡Soy Tito!".
 * 276–300  Cierre feliz.
 */
export const DEMO_DURATION = 300;

export const JUMP = { takeoff: 140, land: 168, height: 235 };

export const DEMO_SPEECH = [{ from: 214, durationInFrames: 50, text: "¡Hola! ¡Soy Tito!" }];

/** Trayectoria de la mariposa en coordenadas del rig (cabeza ≈ (300, 280)). */
const butterflyTrack = createTrack([
  { f: 0, x: 1250, y: -60 },
  { f: 30, x: 1000, y: 40 },
  { f: 48, x: 700, y: 140 },
  { f: 64, x: 600, y: 90 },
  { f: 80, x: 640, y: 0 },
  { f: 96, x: 520, y: -50 },
  { f: 112, x: 390, y: -140 },
  { f: 128, x: 330, y: -175 },
  { f: 142, x: 320, y: -185 },
  { f: 152, x: 300, y: -240 },
  { f: 160, x: 180, y: -420 },
  { f: 176, x: -120, y: -700 },
  { f: 200, x: -600, y: -1100 },
]);

export const butterflyAt = (f: number) => {
  const p = butterflyTrack(f);
  // aleteo errático encima de la trayectoria
  return { x: p.x + noise1(f / 9, 3) * 22, y: p.y + noise1(f / 7, 8) * 18 + Math.sin(f * 0.9) * 6 };
};

const T = JUMP.takeoff;
const L = JUMP.land;

const KEYS: ActKey[] = [
  // ── Reposo ──
  { f: 0, expr: "contento", idle: 1, lookTarget: 0, earL: 0, earR: 0 },
  { f: 36, expr: "contento", headYaw: 0, headRot: 0, lean: 0, hipsX: 0 },

  // ── Atención: ojos primero (38→42), cabeza después (44→54) ──
  { f: 38, lookTarget: 0 },
  { f: 42, lookTarget: 1 },
  { f: 40, earL: 0, earR: 0 },
  { f: 46, expr: "atento", earL: -7, earR: -13 },
  { f: 44, headYaw: 0, headRot: 0 },
  { f: 54, headYaw: 0.45, headRot: 7 },
  { f: 46, lean: 0, hipsX: 0, bend: 0 },
  { f: 60, lean: 3, hipsX: -5, bend: 1 },

  // ── Curiosidad ──
  { f: 64, expr: "curioso", earL: 7, earR: -15 },
  { f: 66, headYaw: 0.5, headRot: 12, lean: 5, bend: 2, hipsX: -8, armRShoulder: 4, armRElbow: 10, armRWrist: 0 },
  { f: 76, armRShoulder: 16, armRElbow: 100, armRWrist: 14 },
  { f: 80, headRot: 9 },
  { f: 88, headRot: 13 },
  { f: 96, expr: "curioso", headYaw: 0.35, lean: 4, hipsX: -6, wagAmt: 4, wagPeriod: 46 },

  // ── Descubrimiento: "¡oh!" y entusiasmo ──
  { f: 104, headRot: 7, headYaw: 0.25, armRShoulder: 16, armRElbow: 100, armRWrist: 14 },
  { f: 112, expr: "asombro", earL: -12, earR: -14, headRot: 0, headYaw: 0.08, lean: 0, bend: 0, hipsX: 0, hipsY: 0, stretch: 1 },
  { f: 115, hipsY: -6, stretch: 1.04, armRShoulder: 6, armRElbow: 24, armRWrist: 0 },
  { f: 118, wagAmt: 12, wagPeriod: 20 },
  { f: 120, expr: "alegre", idle: 1 },
  { f: 122, hipsY: -4, stretch: 1.03, headY: 0, headStretch: 1 },
  { f: 128, expr: "decidido", idle: 0, earL: 4, earR: 4 },

  // ── Anticipación: agacharse lento, sostener ──
  { f: 129, armLShoulder: 0, armRShoulder: 6, armLElbow: 8, armRElbow: 24 },
  { f: 136, hipsY: 30, stretch: 0.84, headStretch: 0.95, headY: 5, armLShoulder: 30, armRShoulder: 30, armLElbow: 34, armRElbow: 34, footLRot: 0, footRRot: 0 },
  { f: 139, hipsY: 33, stretch: 0.82, headStretch: 0.94, headY: 6, stop: true },

  // ── Impulso (3 frames, explosivo) ──
  { f: T + 2, expr: "euforia", hipsY: -16, stretch: 1.2, headStretch: 1.07, headY: -3, armLShoulder: 132, armRShoulder: 136, armLElbow: -12, armRElbow: -12 },
  { f: T, earL: 4, earR: 4 },

  // ── Vuelo ──
  { f: T + 6, stretch: 1.13, footLY: -8, footRY: -8, footLRot: 14, footRRot: 14 },
  { f: T + 14, stretch: 1.0, hipsY: -6, armLShoulder: 120, armRShoulder: 126, armLElbow: -22, armRElbow: -26, footLY: -22, footRY: -26 },
  { f: T + 16, expr: "euforia" },
  { f: T + 20, expr: "risa", stretch: 1.02, armLShoulder: 100, armRShoulder: 106, armLElbow: -8, armRElbow: -8 },
  { f: L - 5, stretch: 1.08, hipsY: -12, footLY: -4, footRY: -4, footLRot: 4, footRRot: 4, armLShoulder: 75, armRShoulder: 80, armLElbow: 10, armRElbow: 10, headStretch: 1.03, headY: -2 },
  { f: L - 1, footLY: 0, footRY: 0, footLRot: 0, footRRot: 0, hipsY: -10, stretch: 1.06 },

  // ── Aterrizaje: aplasta, rebota, asienta ──
  { f: L + 3, hipsY: 34, stretch: 0.78, headStretch: 0.9, headY: 9, armLShoulder: 48, armRShoulder: 52, armLElbow: 26, armRElbow: 26 },
  { f: L + 9, hipsY: -7, stretch: 1.06, headStretch: 1.03, headY: -3, armLShoulder: 18, armRShoulder: 18, armLElbow: 12, armRElbow: 12 },
  { f: L + 15, hipsY: 4, stretch: 0.97, headStretch: 0.99, headY: 1, armLShoulder: 4, armRShoulder: 4 },
  { f: L + 22, hipsY: 0, stretch: 1, headStretch: 1, headY: 0, armLShoulder: 0, armRShoulder: 0, armLElbow: 8, armRElbow: 8 },
  { f: L + 4, headYaw: 0.08 },
  { f: L + 6, earL: 4, earR: 4 },
  { f: L + 24, earL: 0, earR: 0 },
  { f: L + 14, headYaw: 0 },

  // ── Mira a cámara: ojos (182→186) y después cabeza ──
  { f: 182, lookTarget: 1 },
  { f: 186, lookTarget: 0, lookX: 0, lookY: 0 },
  { f: 188, expr: "risa" },
  { f: 196, expr: "alegre", idle: 0 },
  { f: 204, idle: 1 },
  { f: 190, headRot: 0 },
  { f: 200, headRot: -2 },
  { f: 212, headRot: -6 },

  // ── Saludo: anticipación hacia abajo, sube con overshoot, saluda ──
  { f: 200, armRShoulder: 0, armRElbow: 8, armRWrist: 0, lean: 0, hipsX: 0, wave: 0 },
  { f: 204, armRShoulder: -7, armRElbow: 20 },
  { f: 209, armRShoulder: 70, armRElbow: -30 },
  { f: 213, armRShoulder: 102, armRElbow: -64 },
  { f: 218, armRShoulder: 94, armRElbow: -58, lean: -3.5, hipsX: 7, wave: 1 },
  { f: 208, wave: 0 },
  { f: 258, wave: 1, armRShoulder: 94, armRElbow: -58 },
  { f: 264, wave: 0, armRShoulder: 90, armRElbow: -54 },
  // bajada: el antebrazo llega tarde (se dobla al bajar)
  { f: 271, armRShoulder: 30, armRElbow: 46, armRWrist: 6 },
  { f: 277, armRShoulder: -4, armRElbow: 14, armRWrist: 0 },
  { f: 284, armRShoulder: 0, armRElbow: 8, lean: 0, hipsX: 0 },
  { f: 214, expr: "alegre" },
  { f: 262, expr: "alegre", headRot: -6 },

  // ── Cierre feliz: encoge los hombros con una risita ──
  { f: 276, hipsY: 0, stretch: 1, headRot: 3 },
  { f: 281, hipsY: 5, stretch: 0.96 },
  { f: 287, hipsY: -5, stretch: 1.04, armLShoulder: 12, armRShoulder: 12, expr: "risa" },
  { f: 294, hipsY: 0, stretch: 1, armLShoulder: 0, armRShoulder: 0, headRot: -2 },
  { f: 299, expr: "alegre", wagAmt: 10, wagPeriod: 22 },
];

export const createDemoPerformance = () =>
  createPerformance({
    duration: DEMO_DURATION,
    keys: KEYS,
    jumps: [JUMP],
    speech: DEMO_SPEECH,
    blinks: [49, 192, 238],
    noAutoBlink: [
      [120, 200],
      [280, 300],
    ],
    lookAt: butterflyAt,
    earFlicks: [
      { f: 24, side: "L", amount: -9 },
      { f: 92, side: "R", amount: -7 },
      { f: 246, side: "L", amount: -6 },
    ],
    seed: 2,
  });
