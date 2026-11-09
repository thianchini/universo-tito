import { cachedSimulation, ChainSim } from "../../rig/physics";
import { angleDelta, sub, Vec } from "../../rig/math";
import { Spring1D } from "../../rig/spring";
import { apply } from "../../rig/matrix";
import { SCARF, TAIL } from "./chains";
import type { TitoChannels } from "./channels";
import { solveSkeleton } from "./skeleton";
import type { TitoSecondary } from "./TitoRig";

/**
 * Parámetros de la física secundaria de Tito.
 * Ajustados para que la cola sea liviana y esponjosa (ondula y se asienta),
 * la bufanda sea tela con peso, y las orejas sean firmes pero con rebote.
 */
const TAIL_PARAMS = {
  shape: TAIL,
  // Base firme (la sostiene la cadera), punta suelta y liviana.
  periods: [11, 13, 15, 16, 17, 18, 19],
  damping: 0.5,
  gravity: 0.06,
  inertia: 0.7,
  maxDeviation: 28,
  substeps: 4,
};
const SCARF_PARAMS = {
  shape: SCARF,
  periods: [16, 18, 20, 22],
  damping: 0.32,
  gravity: 0.5,
  inertia: 1,
  maxDeviation: 24,
  substeps: 4,
};
/**
 * Orejas: resorte angular propio. Reaccionan a
 * - aceleración horizontal (se quedan atrás),
 * - aceleración vertical (se abren al despegar/aterrizar, flotan en el aire),
 * - giros de la cabeza (llegan tarde y se pasan).
 */
const EAR_PERIOD = 10;
const EAR_DAMPING = 0.3;
const EAR_HORIZONTAL = 0.9; // grados por unidad de aceleración
const EAR_VERTICAL = 2.6;
const EAR_TURN = 0.9;
const EAR_LIMIT = 32;

/**
 * Crea el solucionador de física secundaria para una animación:
 * recibe la función que da los canales de cada frame y devuelve, por frame,
 * la posición de cola, bufanda y el desvío de las orejas.
 */
export const createSecondary = (channelsAt: (frame: number) => TitoChannels): ((frame: number) => TitoSecondary) => {
  const tail = new ChainSim(TAIL_PARAMS);
  const scarf = new ChainSim(SCARF_PARAMS);
  const earL = new Spring1D(EAR_PERIOD, EAR_DAMPING);
  const earR = new Spring1D(EAR_PERIOD, EAR_DAMPING);
  let prevHead: Vec | null = null;
  let prevVel: Vec = { x: 0, y: 0 };
  let prevAngle = 0;
  let prevAngVel = 0;

  return cachedSimulation((frame) => {
    const c = channelsAt(frame);
    const sk = solveSkeleton(c);
    const tailPts = tail.step({ base: sk.tailBase, angle: sk.tailBaseAngle, curl: c.tailCurl });
    const scarfPts = scarf.step({ base: sk.scarfKnot, angle: sk.chestAngle });

    // Aceleración lineal y angular de la cabeza.
    const head = apply(sk.head, { x: 300, y: 250 });
    const vel = prevHead ? sub(head, prevHead) : { x: 0, y: 0 };
    const acc = prevHead ? sub(vel, prevVel) : { x: 0, y: 0 };
    const angVel = prevHead ? angleDelta(prevAngle, sk.headAngle) : 0;
    const angAcc = angVel - prevAngVel;
    prevHead = head;
    prevVel = vel;
    prevAngle = sk.headAngle;
    prevAngVel = angVel;

    // Positivo = hacia afuera. La izquierda se abre girando en sentido antihorario.
    const lag = -acc.x * EAR_HORIZONTAL - angAcc * EAR_TURN;
    const flop = -acc.y * EAR_VERTICAL;
    const l = earL.step(0, (flop - lag) * 0.12);
    const r = earR.step(0, (flop + lag) * 0.12);
    const lim = (v: number) => Math.max(-EAR_LIMIT, Math.min(EAR_LIMIT, v));
    return {
      tail: tailPts,
      scarf: scarfPts,
      // earL del rig: positivo = horario; "afuera" para la izquierda es antihorario.
      earL: -lim(l),
      earR: lim(r),
    };
  });
};
