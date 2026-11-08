import { fade } from "@remotion/transitions/fade";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { linearTiming, TransitionPresentation, TransitionSeries } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill } from "remotion";
import { AudioLayer } from "../audio/AudioLayer";
import { VIDEO } from "../config/video";
import "../theme/fonts";
import type { EpisodeDefinition, TransitionKind } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentationFor = (kind: TransitionKind): TransitionPresentation<any> => {
  switch (kind) {
    case "slide":
      return slide({ direction: "from-right" });
    case "wipe":
      return wipe({ direction: "from-left" });
    case "clockWipe":
      return clockWipe({ width: VIDEO.width, height: VIDEO.height });
    case "fade":
    default:
      return fade();
  }
};

/** Duración total de un episodio, descontando el solapamiento de las transiciones. */
export const episodeDuration = (ep: EpisodeDefinition): number =>
  ep.scenes.reduce(
    (acc, s, i) =>
      acc + s.durationInFrames - (i > 0 && s.transitionIn && s.transitionIn.kind !== "none" ? s.transitionIn.durationInFrames : 0),
    0,
  );

/** Reproduce las escenas de un episodio en orden, con sus transiciones y música. */
export const Episode: React.FC<{ episode: EpisodeDefinition }> = ({ episode }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <TransitionSeries>
      {episode.scenes.flatMap((scene, i) => {
        const items: React.ReactNode[] = [];
        const t = scene.transitionIn;
        if (i > 0 && t && t.kind !== "none") {
          items.push(
            <TransitionSeries.Transition
              key={`${scene.id}-t`}
              presentation={presentationFor(t.kind)}
              timing={linearTiming({ durationInFrames: t.durationInFrames })}
            />,
          );
        }
        const Scene = scene.component;
        items.push(
          <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames} name={scene.title}>
            <Scene />
          </TransitionSeries.Sequence>,
        );
        return items;
      })}
    </TransitionSeries>
    <AudioLayer music={episode.music} />
  </AbsoluteFill>
);

const componentCache = new Map<string, React.FC>();

/**
 * Componente sin props para registrar un episodio como <Composition>.
 * (Las props de Remotion se serializan a JSON, por eso no se pueden pasar
 * las escenas —que son funciones— como defaultProps.)
 */
export const episodeComponent = (episode: EpisodeDefinition): React.FC => {
  let c = componentCache.get(episode.compositionId);
  if (!c) {
    const EpisodeComposition: React.FC = () => <Episode episode={episode} />;
    EpisodeComposition.displayName = `Episode(${episode.compositionId})`;
    c = EpisodeComposition;
    componentCache.set(episode.compositionId, c);
  }
  return c;
};
