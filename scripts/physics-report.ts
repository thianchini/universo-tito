// Informe numérico de la física secundaria para el movimiento de prueba.
import { Easing } from "remotion";
import { kinematicChain, SCARF, TAIL } from "../src/characters/tito-rig/chains";
import { withRest } from "../src/characters/tito-rig/channels";
import { createSecondary } from "../src/characters/tito-rig/secondary";
import { solveSkeleton } from "../src/characters/tito-rig/skeleton";
import { lerp } from "../src/lib/motion";

const testChannels = (f: number) => {
  const lean = lerp(f, [15, 24, 50, 62], [0, 12, 12, 0], Easing.inOut(Easing.cubic));
  const hipsX = lerp(f, [15, 24, 50, 62], [0, -18, -18, 0], Easing.inOut(Easing.cubic));
  const t = (f - 75) / 24;
  const rootY = t > 0 && t < 1 ? -4 * 220 * t * (1 - t) : 0;
  return withRest({ lean, hipsX, rootY });
};
const sec = createSecondary(testChannels);
console.log("frame  lean  rootY | tailTipΔx tailTipΔy | scarfTipΔx scarfTipΔy | earL  earR");
for (let f = 0; f < 140; f += 2) {
  const c = testChannels(f);
  const sk = solveSkeleton(c);
  const kt = kinematicChain(TAIL, sk.tailBase, sk.tailBaseAngle, c.tailCurl);
  const ks = kinematicChain(SCARF, sk.scarfKnot, sk.chestAngle);
  const s = sec(f);
  const tt = s.tail[s.tail.length - 1], kk = kt[kt.length - 1];
  const st = s.scarf[s.scarf.length - 1], ksk = ks[ks.length - 1];
  const r = (n: number) => n.toFixed(1).padStart(7);
  console.log(`${String(f).padStart(5)} ${r(c.lean)} ${r(c.rootY)} | ${r(tt.x - kk.x)} ${r(tt.y - kk.y)} | ${r(st.x - ksk.x)} ${r(st.y - ksk.y)} | ${r(s.earL)} ${r(s.earR)}`);
}
