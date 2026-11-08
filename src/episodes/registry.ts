import { ep00Presentacion } from "./ep00-presentacion";
import type { EpisodeDefinition } from "./types";

/**
 * Registro de episodios. Para crear un episodio nuevo:
 *   1. Copiá la carpeta `src/episodes/_plantilla` a `src/episodes/epXX-tema`.
 *   2. Escribí el guion (script.ts) y las escenas.
 *   3. Agregalo a esta lista: aparece solo en Remotion Studio.
 */
export const EPISODES: EpisodeDefinition[] = [ep00Presentacion];
