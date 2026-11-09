import React from "react";
import { AbsoluteFill } from "remotion";
import { Tito } from "../characters/tito";
import { withRest, PartialChannels } from "../characters/tito-rig/channels";
import { TitoRig } from "../characters/tito-rig/TitoRig";
import { FONT_FAMILY } from "../theme/fonts";

const POSES: Array<{ label: string; p: PartialChannels }> = [
  { label: "Rig v3 · reposo", p: {} },
  { label: "Agachado (aplasta)", p: { hipsY: 32, stretch: 0.82, headStretch: 0.93, armLShoulder: 25, armRShoulder: 25, armLElbow: 30, armRElbow: 30 } },
  { label: "Estirado (impulso)", p: { hipsY: -12, stretch: 1.2, headStretch: 1.06, armLShoulder: 150, armRShoulder: 150, armLElbow: -20, armRElbow: -20 } },
  { label: "Peso + curva", p: { hipsX: -14, lean: 8, bend: 8, headRot: 10, armRShoulder: 30, armRElbow: 70, armLShoulder: 8 } },
  { label: "Saludo", p: { armRShoulder: 145, armRElbow: -35, armRWrist: -10, lean: -3, headRot: -5 } },
];

/** Hoja de prueba del rig: compara con el diseño v2 y verifica deformaciones. */
export const RigPoseSheet: React.FC<{ showBones?: boolean }> = ({ showBones = false }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#FFF7E8, #FFE3C2)", fontFamily: FONT_FAMILY }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignContent: "flex-start", paddingTop: 30 }}>
      <Cell label="Tito v2 (referencia)">
        <Tito height={560} />
      </Cell>
      {POSES.map(({ label, p }) => (
        <Cell key={label} label={label}>
          <TitoRig height={560} c={withRest(p)} showBones={showBones} />
        </Cell>
      ))}
    </div>
  </AbsoluteFill>
);

const Cell: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ width: 520, height: 620, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
    {children}
    <div style={{ fontSize: 34, fontWeight: 700, color: "#5A2C12", marginTop: 4 }}>{label}</div>
  </div>
);
