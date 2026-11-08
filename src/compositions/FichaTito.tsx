import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Tito, TITO_COLORS, titoIdle } from "../characters/tito";
import type { TitoExpression, TitoPose } from "../characters/tito";
import { FONT_FAMILY } from "../theme/fonts";

const POSES: Array<{ label: string; expression: TitoExpression; pose: TitoPose }> = [
  { label: "Feliz", expression: "feliz", pose: {} },
  { label: "Sorpresa", expression: "sorpresa", pose: { mouthOpen: 0.8, armRight: -140, armLeft: 120 } },
  { label: "Curioso", expression: "curioso", pose: { lookX: -1, headTilt: -8 } },
  { label: "Guiño", expression: "guino", pose: { armRight: -150, mouthOpen: 0.5, headTilt: -6 } },
];

/**
 * FICHA DE PERSONAJE (model sheet): referencia visual de Tito para mantener
 * la consistencia entre episodios. Renderizala como imagen con `npm run render:ficha`.
 */
export const FichaTito: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#FFF7E8, #FFE3C2)", fontFamily: FONT_FAMILY, alignItems: "center" }}>
      <div style={{ fontSize: 96, fontWeight: 700, color: TITO_COLORS.furShade, marginTop: 80 }}>Tito · Ficha</div>
      <div style={{ fontSize: 40, fontWeight: 600, color: "#7A4A2A", marginTop: 6 }}>Zorro naranja · ojos ámbar · bufanda amarilla</div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", width: 1000, marginTop: 30 }}>
        {POSES.map((p) => (
          <div key={p.label} style={{ width: 480, height: 700, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Tito height={600} pose={{ ...titoIdle(f), ...p.pose, expression: p.expression }} />
            <div style={{ fontSize: 48, fontWeight: 700, color: "#5A2C12" }}>{p.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
        {(["fur", "cream", "iris", "scarf", "paws"] as const).map((k) => (
          <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: 26, color: "#5A2C12" }}>
            <div style={{ width: 120, height: 80, borderRadius: 20, background: TITO_COLORS[k], border: "4px solid #5A2C12" }} />
            {TITO_COLORS[k]}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
