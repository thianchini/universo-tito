import React from "react";
import { Composition, Folder, Still } from "remotion";
import { FichaTito } from "./compositions/FichaTito";
import { VIDEO } from "./config/video";
import { episodeComponent, episodeDuration } from "./episodes/Episode";
import { EPISODES } from "./episodes/registry";
import "./theme/fonts";

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Episodios">
      {EPISODES.map((ep) => (
        <Composition
          key={ep.compositionId}
          id={ep.compositionId}
          component={episodeComponent(ep)}
          durationInFrames={episodeDuration(ep)}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
      ))}
    </Folder>
    <Folder name="Personajes">
      <Still id="FichaTito" component={FichaTito} width={VIDEO.width} height={VIDEO.height} />
    </Folder>
  </>
);
