import React from "react";
import { AbsoluteFill } from "remotion";
import { bouncy, wave } from "../lib/motion";
import { FONT_FAMILY } from "../theme/fonts";
import { PALETTE } from "../theme/palette";

const Letters: React.FC<{ text: string; frame: number; delay: number; size: number; stagger: number }> = ({
  text,
  frame,
  delay,
  size,
  stagger,
}) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    {text.split("").map((ch, i) => {
      const p = bouncy(frame, delay + i * stagger);
      const color = PALETTE.logo[i % PALETTE.logo.length];
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: size,
            color,
            WebkitTextStroke: `${size * 0.07}px #FFFFFF`,
            paintOrder: "stroke fill",
            textShadow: `0 ${size * 0.06}px 0 rgba(43,26,16,0.35)`,
            transform: `translateY(${(1 - p) * -260 + wave(frame, 40, 8, i * 0.7)}px) rotate(${(1 - p) * 40 + wave(frame, 50, 3, i)}deg) scale(${p})`,
            opacity: p > 0.01 ? 1 : 0,
            margin: "0 4px",
          }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);

/**
 * Logo animado "UNIVERSO TITO". `frame` es relativo al inicio de su aparición;
 * `exit` 0..1 lo hace salir volando hacia arriba.
 */
export const TitleLogo: React.FC<{ frame: number; exit?: number; top?: number }> = ({ frame, exit = 0, top = 260 }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      paddingTop: top,
      transform: `translateY(${-exit * 900}px) scale(${1 - exit * 0.3})`,
    }}
  >
    <Letters text="UNIVERSO" frame={frame} delay={0} size={110} stagger={3} />
    <div style={{ marginTop: -30 }}>
      <Letters text="TITO" frame={frame} delay={22} size={260} stagger={5} />
    </div>
  </AbsoluteFill>
);
