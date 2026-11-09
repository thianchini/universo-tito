import React from "react";
import { AbsoluteFill } from "remotion";
import { withRest } from "../characters/tito-rig/channels";
import { EXPRESSIONS, ExpressionName } from "../characters/tito-rig/face";
import { TitoRig } from "../characters/tito-rig/TitoRig";
import { FONT_FAMILY } from "../theme/fonts";

const EXTRA: Partial<Record<ExpressionName, Record<string, number>>> = {
  curioso: { headRot: -9, lookX: 0.7, lookY: -0.3, earR: -10, earL: 6 },
  atento: { earL: -8, earR: -8 },
  asombro: { earL: -10, earR: -10 },
  risa: { headRot: 5 },
  decidido: { lookY: -0.4 },
  euforia: { earL: 8, earR: 8 },
};

/** Hoja de expresiones del rig (sólo cabeza y torso, grande). */
export const ExpressionSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#FFF7E8, #FFE3C2)", fontFamily: FONT_FAMILY }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", paddingTop: 20 }}>
      {(Object.keys(EXPRESSIONS) as ExpressionName[]).map((name) => (
        <div key={name} style={{ width: 520, height: 470, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}>
          <div style={{ height: 410, overflow: "hidden", display: "flex", justifyContent: "center" }}>
            <TitoRig height={760} c={withRest({ ...EXPRESSIONS[name], ...(EXTRA[name] ?? {}) })} style={{ marginTop: -10 }} />
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#5A2C12" }}>{name}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
