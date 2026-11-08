/**
 * Tipos del sistema de audio de UNIVERSO TITO.
 * Las rutas (`src`) son relativas a la carpeta `public/`.
 * Ejemplo: "audio/voces/ep00/01-hola.mp3"
 */

/** Pista de música de fondo. */
export type MusicCue = {
  src: string;
  /** Volumen base 0..1 (la música debe quedar por debajo de la voz: ~0.25). */
  volume?: number;
  /** Frame de inicio relativo a la escena/episodio. */
  from?: number;
  /** Duración en frames (por defecto, hasta el final). */
  durationInFrames?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  loop?: boolean;
  /** Bajar la música automáticamente mientras habla un personaje. */
  duckUnderVoice?: boolean;
};

/** Efecto de sonido puntual. */
export type SfxCue = {
  id: string;
  src: string;
  from: number;
  volume?: number;
  durationInFrames?: number;
};

export type Speaker = "tito" | "narrador";

/** Una línea de diálogo: subtítulo + (opcional) archivo de voz. */
export type DialogueLine = {
  id: string;
  speaker: Speaker;
  /** Frame de inicio relativo a la escena. */
  from: number;
  durationInFrames: number;
  text: string;
  /** Archivo de voz grabado/locutado. Si no existe todavía, se ignora sin romper. */
  voice?: string;
  volume?: number;
};
