import React from "react";
import { TITO_FEET, TITO_VIEWBOX } from "./tito/design";

/**
 * Posiciona un personaje por sus PIES (x, y en px de pantalla),
 * que es lo natural para caminar, saltar y apoyarse en el piso.
 */
export const CharacterOnStage: React.FC<{
  x: number;
  y: number;
  height: number;
  rotate?: number;
  children: React.ReactNode;
}> = ({ x, y, height, rotate = 0, children }) => {
  const scale = height / TITO_VIEWBOX.height;
  const width = TITO_VIEWBOX.width * scale;
  const left = x - TITO_FEET.x * scale;
  const top = y - TITO_FEET.y * scale;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: `${TITO_FEET.x * scale}px ${TITO_FEET.y * scale}px`,
      }}
    >
      {children}
    </div>
  );
};
