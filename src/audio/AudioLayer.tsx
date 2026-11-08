import { Audio } from "@remotion/media";
import { getStaticFiles } from "@remotion/studio";
import React, { useMemo } from "react";
import { interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import type { DialogueLine, MusicCue, SfxCue } from "./types";

/** Conjunto de archivos presentes en public/ (lo calcula Remotion al empaquetar). */
const useAvailableFiles = (): Set<string> =>
  useMemo(() => new Set(getStaticFiles().map((f) => f.name)), []);

const DUCK_VOLUME = 0.35;
const DUCK_RAMP = 8;

/** Factor 0..1 para bajar la música cuando hay voz sonando en el frame f. */
const duckFactor = (f: number, lines: DialogueLine[]): number => {
  let factor = 1;
  for (const l of lines) {
    const v = interpolate(
      f,
      [l.from - DUCK_RAMP, l.from, l.from + l.durationInFrames, l.from + l.durationInFrames + DUCK_RAMP],
      [1, DUCK_VOLUME, DUCK_VOLUME, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    factor = Math.min(factor, v);
  }
  return factor;
};

/**
 * Capa de audio de una escena o episodio.
 * - Reproduce sólo los archivos que existen en public/ (el resto se ignora),
 *   así el video se puede renderizar antes de tener las voces finales.
 * - Música con fade in/out y "ducking" automático bajo las voces.
 */
export const AudioLayer: React.FC<{
  music?: MusicCue[];
  sfx?: SfxCue[];
  dialogue?: DialogueLine[];
}> = ({ music = [], sfx = [], dialogue = [] }) => {
  const files = useAvailableFiles();
  const { durationInFrames } = useVideoConfig();
  const has = (src?: string): src is string => Boolean(src && files.has(src));
  const voiced = dialogue.filter((l) => has(l.voice));

  return (
    <>
      {music.filter((m) => has(m.src)).map((m) => {
        const from = m.from ?? 0;
        const dur = m.durationInFrames ?? durationInFrames - from;
        const base = m.volume ?? 0.25;
        const fadeIn = m.fadeInFrames ?? 20;
        const fadeOut = m.fadeOutFrames ?? 30;
        return (
          <Sequence key={m.src} from={from} durationInFrames={dur} layout="none" name={`Música: ${m.src}`}>
            <Audio
              src={staticFile(m.src)}
              loop={m.loop ?? true}
              volume={(f) =>
                base *
                interpolate(f, [0, fadeIn, dur - fadeOut, dur], [0, 1, 1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }) *
                (m.duckUnderVoice === false ? 1 : duckFactor(f + from, voiced))
              }
            />
          </Sequence>
        );
      })}

      {voiced.map((l) => (
        <Sequence key={l.id} from={l.from} durationInFrames={l.durationInFrames + 30} layout="none" name={`Voz: ${l.id}`}>
          <Audio src={staticFile(l.voice!)} volume={l.volume ?? 1} />
        </Sequence>
      ))}

      {sfx.filter((s) => has(s.src)).map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames ?? 90} layout="none" name={`SFX: ${s.id}`}>
          <Audio src={staticFile(s.src)} volume={s.volume ?? 0.8} />
        </Sequence>
      ))}
    </>
  );
};
