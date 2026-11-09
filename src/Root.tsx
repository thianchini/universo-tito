import React from "react";
import { Composition, Folder, Still } from "remotion";
import { FichaTito } from "./compositions/FichaTito";
import { TitoDemo } from "./lab/demo/TitoDemo";
import { ExpressionSheet } from "./lab/ExpressionSheet";
import { RigPhysicsTest } from "./lab/RigPhysicsTest";
import { RigPoseSheet } from "./lab/RigPoseSheet";
import { TurnaroundSheet } from "./lab/TurnaroundSheet";
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
    <Folder name="Laboratorio">
      <Composition id="TitoDemoAnimacion" component={TitoDemo} defaultProps={{ showBones: false }} durationInFrames={300} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="RigFisica" component={RigPhysicsTest} durationInFrames={140} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Still id="RigExpresiones" component={ExpressionSheet} width={VIDEO.width} height={VIDEO.height} />
      <Still id="TitoGiro" component={TurnaroundSheet} width={1920} height={1080} />
      <Still id="RigPoses" component={RigPoseSheet} defaultProps={{ showBones: false }} width={VIDEO.width} height={VIDEO.height} />
    </Folder>
    <Folder name="Personajes">
      <Still id="FichaTito" component={FichaTito} width={VIDEO.width} height={VIDEO.height} />
    </Folder>
  </>
);
