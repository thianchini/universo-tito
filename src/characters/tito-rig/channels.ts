/**
 * CANALES DE ANIMACIÓN DE TITO (rig v3).
 * Cada canal es un número animable. Las acciones, capas y expresiones sólo
 * producen valores para estos canales; el rig los convierte en dibujo.
 *
 * Convenciones:
 * - Distancias en unidades del lienzo de Tito (600×820, pies en y=790).
 * - Ángulos en grados.
 */
export type TitoChannels = {
  // ── Raíz (desplazamiento del personaje completo; saltos) ──
  rootX: number;
  rootY: number;

  // ── Cuerpo ──
  /** Desplazamiento de la cadera (peso). hipsY positivo = agacharse. */
  hipsX: number;
  hipsY: number;
  /** Inclinación de la columna desde la cadera (positivo = hacia la derecha de pantalla). */
  lean: number;
  /** Curvatura del pecho respecto de la cadera. */
  bend: number;
  /** Estiramiento del torso conservando volumen (1 = normal, <1 aplasta, >1 estira). */
  stretch: number;
  /** Respiración 0..1. */
  breath: number;

  // ── Cabeza ──
  headRot: number;
  headX: number;
  headY: number;
  /** Aplastar/estirar de la cabeza (más sutil que el cuerpo). */
  headStretch: number;
  /** Giro de la cara hacia un lado (-1..1), desplaza los rasgos (2,5D). */
  headYaw: number;

  // ── Brazos (0 = colgando; hombro positivo = levantar hacia afuera; codo positivo = doblar hacia el cuerpo) ──
  armLShoulder: number;
  armLElbow: number;
  armLWrist: number;
  armRShoulder: number;
  armRElbow: number;
  armRWrist: number;

  // ── Pies (desplazamiento respecto de su apoyo; footY negativo = levantar) ──
  footLX: number;
  footLY: number;
  footLRot: number;
  footRX: number;
  footRY: number;
  footRRot: number;

  // ── Cola / orejas (ángulo base; la física agrega la inercia) ──
  tailWag: number;
  tailCurl: number;
  /** Orejas: positivo = hacia afuera (caídas), negativo = paradas/atentas. */
  earL: number;
  earR: number;

  // ── Cara ──
  lookX: number;
  lookY: number;
  /** Tamaño de pupila (1 normal, <1 sorpresa/foco, >1 ternura). */
  pupil: number;
  /** Apertura de cada ojo (1 normal, >1 muy abiertos). */
  eyeOpenL: number;
  eyeOpenR: number;
  /** Párpado inferior que sube con la sonrisa (0..1). */
  lowerLidL: number;
  lowerLidR: number;
  /** Parpadeo 0..1 (lo agrega la capa de parpadeo). */
  blink: number;
  /** Altura de cada ceja (-1 baja, 1 muy alta). */
  browLY: number;
  browRY: number;
  /** Inclinación: positivo levanta el extremo interior (preocupación/ternura), negativo lo baja (concentración). */
  browLTilt: number;
  browRTilt: number;
  /** Sonrisa (-1 triste, 0 neutra, 1 feliz). */
  smile: number;
  /** Apertura de boca 0..1. */
  mouthOpen: number;
  /** Ancho de boca (1 normal, <1 redondeada "o", >1 ancha). */
  mouthWide: number;
  /** Desplazamiento lateral de la boca (px). */
  mouthShift: number;
  /** Intensidad del rubor de los cachetes. */
  blush: number;
};

export type ChannelName = keyof TitoChannels;

/** Pose de reposo: Tito parado, relajado y contento. */
export const REST: TitoChannels = {
  rootX: 0,
  rootY: 0,
  hipsX: 0,
  hipsY: 0,
  lean: 0,
  bend: 0,
  stretch: 1,
  breath: 0,
  headRot: 0,
  headX: 0,
  headY: 0,
  headStretch: 1,
  headYaw: 0,
  armLShoulder: 0,
  armLElbow: 8,
  armLWrist: 0,
  armRShoulder: 0,
  armRElbow: 8,
  armRWrist: 0,
  footLX: 0,
  footLY: 0,
  footLRot: 0,
  footRX: 0,
  footRY: 0,
  footRRot: 0,
  tailWag: 0,
  tailCurl: 0,
  earL: 0,
  earR: 0,
  lookX: 0,
  lookY: 0,
  pupil: 1,
  eyeOpenL: 1,
  eyeOpenR: 1,
  lowerLidL: 0,
  lowerLidR: 0,
  blink: 0,
  browLY: 0,
  browRY: 0,
  browLTilt: 0,
  browRTilt: 0,
  smile: 0.6,
  mouthOpen: 0,
  mouthWide: 1,
  mouthShift: 0,
  blush: 0.55,
};

export const CHANNEL_NAMES = Object.keys(REST) as ChannelName[];

export type PartialChannels = Partial<TitoChannels>;

/** Completa una pose parcial con los valores de reposo. */
export const withRest = (p: PartialChannels): TitoChannels => ({ ...REST, ...p });
