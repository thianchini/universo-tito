import React from "react";
import { AbsoluteFill } from "remotion";
import { REST } from "../characters/tito-rig/channels";
import { TitoRig } from "../characters/tito-rig/TitoRig";
import { TitoProfile, TitoThreeQuarter } from "../characters/tito-rig/views";
import { FONT_FAMILY } from "../theme/fonts";

const H = 780;
const SCALE = H / 820;
// Líneas de referencia (en coordenadas del lienzo de Tito): punta de orejas, ojos, mentón, cintura, pies.
const GUIDES: Array<[number, string]> = [
  [45, "orejas"],
  [282, "ojos"],
  [470, "mentón"],
  [640, "panza"],
  [790, "pies"],
];

/** Ficha de giro: frente, tres cuartos y perfil con guías de altura. */
export const TurnaroundSheet: React.FC = () => {
  const top = 190;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#FFF7E8, #FFE3C2)", fontFamily: FONT_FAMILY, alignItems: "center" }}>
      <div style={{ fontSize: 76, fontWeight: 700, color: "#D96C1C", marginTop: 30 }}>Tito · Giro</div>
      <div style={{ fontSize: 34, fontWeight: 600, color: "#7A4A2A" }}>Frente · Tres cuartos · Perfil</div>
      {GUIDES.map(([y, label]) => (
        <div key={label} style={{ position: "absolute", left: 30, right: 30, top: top + y * SCALE, borderTop: "3px dashed rgba(122,74,42,0.25)" }}>
          <span style={{ position: "absolute", right: 0, top: -30, fontSize: 22, color: "rgba(122,74,42,0.55)", fontWeight: 600 }}>{label}</span>
        </div>
      ))}
      <div style={{ position: "absolute", top, display: "flex", gap: 0, justifyContent: "center", width: "100%" }}>
        <div style={{ width: 600, display: "flex", justifyContent: "center" }}>
          <TitoRig height={H} c={REST} />
        </div>
        <div style={{ width: 600, display: "flex", justifyContent: "center" }}>
          <TitoThreeQuarter height={H} />
        </div>
        <div style={{ width: 600, display: "flex", justifyContent: "center" }}>
          <TitoProfile height={H} />
        </div>
      </div>
      <div style={{ position: "absolute", top: top + H + 4, display: "flex", width: "100%", justifyContent: "center", fontSize: 40, fontWeight: 700, color: "#5A2C12" }}>
        <div style={{ width: 600, textAlign: "center" }}>Frente</div>
        <div style={{ width: 600, textAlign: "center" }}>Tres cuartos</div>
        <div style={{ width: 600, textAlign: "center" }}>Perfil</div>
      </div>
    </AbsoluteFill>
  );
};
