import { blinkAt, blinkSchedule, speechAt } from "../src/characters/tito-rig/face";
const lines = [{ from: 10, durationInFrames: 50, text: "¡Hola! ¡Soy Tito!" }];
let row = "";
for (let f = 6; f < 66; f++) {
  const s = speechAt(f, lines);
  row += `${f}:${s.open.toFixed(2)}/${s.wide.toFixed(2)}${s.emphasis > 0.5 ? "*" : ""}  `;
  if ((f - 5) % 6 === 0) { console.log(row); row = ""; }
}
console.log(row);
const sch = blinkSchedule(300, [48], 3);
console.log("parpadeos:", sch.join(", "));
console.log("forma:", [...Array(9)].map((_, t) => blinkAt(100 + t, [100]).toFixed(2)).join(" "));
