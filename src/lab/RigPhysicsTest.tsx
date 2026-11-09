import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { withRest } from "../characters/tito-rig/channels";
import { createSecondary } from "../characters/tito-rig/secondary";
import { TitoRig } from "../characters/tito-rig/TitoRig";
import { lerp } from "../lib/motion";
import { Easing } from "remotion";

/** Movimiento de prueba: inclinación brusca, frenada y un salto simple. */
const testChannels = (f: number) => {
  const lean = lerp(f, [15, 24, 50, 62], [0, 12, 12, 0], Easing.inOut(Easing.cubic));
  const hipsX = lerp(f, [15, 24, 50, 62], [0, -18, -18, 0], Easing.inOut(Easing.cubic));
  const t = (f - 75) / 24;
  const rootY = t > 0 && t < 1 ? -4 * 220 * t * (1 - t) : 0;
  return withRest({ lean, hipsX, rootY });
};

export const RigPhysicsTest: React.FC = () => {
  const frame = useCurrentFrame();
  const secondary = useMemo(() => createSecondary(testChannels), []);
  return (
    <AbsoluteFill style={{ background: "#FFF3E0", alignItems: "center", justifyContent: "center" }}>
      <TitoRig c={testChannels(frame)} secondary={secondary(frame)} height={900} />
    </AbsoluteFill>
  );
};
