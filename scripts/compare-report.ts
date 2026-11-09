// Mide el arrastre agregado y la actividad en reposo.
import { createDemoPerformance, JUMP } from "../src/lab/demo/script";
const perf = createDemoPerformance();
const show = (f: number) => {
  const c = perf.channelsAt(f);
  return `f${f}: headY ${c.headY.toFixed(1)} headRot ${c.headRot.toFixed(1)} armL ${c.armLShoulder.toFixed(1)} armR ${c.armRShoulder.toFixed(1)} wristR ${c.armRWrist.toFixed(1)} earL ${c.earL.toFixed(1)} tailWag ${c.tailWag.toFixed(1)}`;
};
for (const f of [10, 24, 27, 30, 50, 60, JUMP.takeoff + 1, JUMP.takeoff + 3, JUMP.takeoff + 6, JUMP.land + 1, JUMP.land + 3, JUMP.land + 6, JUMP.land + 10, 212, 230, 270, 276]) console.log(show(f));
