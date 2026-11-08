/**
 * Biblioteca central de efectos de sonido.
 * Colocá los archivos en public/audio/sfx/ con estos nombres.
 * Si un archivo aún no existe, el AudioLayer simplemente no lo reproduce.
 */
export const SFX = {
  pop: "audio/sfx/pop.mp3",
  boing: "audio/sfx/boing.mp3",
  whoosh: "audio/sfx/whoosh.mp3",
  rustle: "audio/sfx/arbusto.mp3",
  sparkle: "audio/sfx/brillo.mp3",
  birds: "audio/sfx/pajaritos.mp3",
  landing: "audio/sfx/aterrizaje.mp3",
} as const;

export const MUSIC = {
  themeMain: "audio/musica/tema-universo-tito.mp3",
  forestAmbience: "audio/musica/ambiente-bosque.mp3",
} as const;
