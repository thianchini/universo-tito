// Detector de tirones: busca cambios bruscos de aceleración en cada canal.
import { CHANNEL_NAMES } from "../src/characters/tito-rig/channels";
import { createDemoPerformance, JUMP } from "../src/lab/demo/script";

const perf = createDemoPerformance();
const N = perf.duration;
const frames = [...Array(N)].map((_, f) => perf.channelsAt(f));
// Umbrales de "aceleración" por frame² según la escala de cada canal.
const scale: Record<string, number> = { rootX: 40, rootY: 40, hipsX: 6, hipsY: 6, lean: 3, bend: 3, stretch: 0.05, headRot: 4, headX: 4, headY: 4, headStretch: 0.03, headYaw: 0.08 };
const expected = (f: number) => Math.abs(f - JUMP.takeoff) <= 3 || Math.abs(f - JUMP.land) <= 4;
const issues: string[] = [];
for (const name of CHANNEL_NAMES) {
  if (name === "blink") continue; // el parpadeo es rápido a propósito
  const thr = scale[name] ?? (name.startsWith("arm") ? 9 : name.startsWith("foot") ? 6 : name.startsWith("ear") ? 5 : name.startsWith("tail") ? 6 : 0.12);
  for (let f = 2; f < N; f++) {
    const a = frames[f][name] - 2 * frames[f - 1][name] + frames[f - 2][name];
    if (Math.abs(a) > thr && !expected(f)) issues.push(`f${f} ${name}: aceleración ${a.toFixed(2)} (umbral ${thr})`);
  }
}
// Física: la punta de la cola no debe "teletransportarse".
let maxTail = 0;
let at = 0;
for (let f = 1; f < N; f++) {
  const a = perf.secondaryAt(f).tail.at(-1)!;
  const b = perf.secondaryAt(f - 1).tail.at(-1)!;
  const d = Math.hypot(a.x - b.x, a.y - b.y);
  if (d > maxTail) {
    maxTail = d;
    at = f;
  }
}
console.log(issues.length ? issues.join("\n") : "Sin tirones fuera de despegue/aterrizaje.");
console.log(`Velocidad máxima de la punta de la cola: ${maxTail.toFixed(1)} u/frame (frame ${at})`);
