/**
 * Formato oficial de UNIVERSO TITO.
 * Vertical 9:16 · 1080×1920 · 30 fps.
 * Todas las composiciones deben usar estos valores.
 */
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/** Convierte segundos a frames con el fps oficial. */
export const sec = (seconds: number): number => Math.round(seconds * VIDEO.fps);

/** Zonas seguras para vertical (redes sociales tapan arriba y abajo). */
export const SAFE_AREA = {
  top: 220,
  bottom: 300,
  side: 70,
} as const;
