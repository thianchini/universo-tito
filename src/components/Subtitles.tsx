import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SAFE_AREA } from "../config/video";
import { activeLine } from "../audio/dialogue";
import type { DialogueLine } from "../audio/types";
import { bouncy, lerp } from "../lib/motion";
import { FONT_FAMILY } from "../theme/fonts";
import { PALETTE } from "../theme/palette";

/**
 * Globo de subtítulos: aparece con rebote y las palabras "saltan" una por una
 * al ritmo de la línea (ayuda a la pre-lectura de los más chiquitos).
 */
export const Subtitles: React.FC<{
  lines: DialogueLine[];
  /** "top" usa el cielo (no tapa a los personajes); "bottom" es el clásico. */
  placement?: "top" | "bottom";
}> = ({ lines, placement = "top" }) => {
  const frame = useCurrentFrame();
  const line = activeLine(frame, lines);
  if (!line) return null;

  const local = frame - line.from;
  const enter = bouncy(local);
  const exit = lerp(local, [line.durationInFrames - 6, line.durationInFrames], [1, 0]);
  const words = line.text.split(" ");
  const perWord = Math.max(3, (line.durationInFrames * 0.6) / words.length);

  return (
    <AbsoluteFill
      style={{
        justifyContent: placement === "top" ? "flex-start" : "flex-end",
        alignItems: "center",
        paddingTop: placement === "top" ? SAFE_AREA.top + 40 : 0,
        paddingBottom: placement === "bottom" ? SAFE_AREA.bottom - 120 : 0,
      }}
    >
      <div
        style={{
          transform: `scale(${enter * exit})`,
          opacity: exit,
          background: PALETTE.ui.bubble,
          borderRadius: 60,
          padding: "34px 56px",
          maxWidth: 940,
          boxShadow: "0 14px 0 rgba(43,26,16,0.18), 0 20px 40px rgba(0,0,0,0.18)",
          border: `8px solid ${line.speaker === "tito" ? PALETTE.ui.accent : "#4DB8FF"}`,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontWeight: 700,
          fontSize: 76,
          lineHeight: 1.15,
          color: PALETTE.ui.ink,
        }}
      >
        {words.map((w, i) => {
          const p = bouncy(local, i * perWord);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: i < words.length - 1 ? "0.28em" : 0,
                transform: `translateY(${(1 - p) * 30}px) scale(${0.6 + 0.4 * p})`,
                opacity: Math.min(1, p * 1.5),
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
