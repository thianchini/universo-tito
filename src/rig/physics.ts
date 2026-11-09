import { add, angleDelta, clamp, dir, lerpVec, mix, mul, perpRight, sub, Vec } from "./math";

/** Definición de cadena: longitudes y ángulos de reposo (ver chains.ts). */
export type ChainShape = { lengths: number[]; relAngles: number[] };

export type ChainParams = {
  shape: ChainShape;
  /**
   * Período natural de oscilación de cada tramo, en frames.
   * Más corto = más firme (oreja); más largo = más suelto (punta de cola, tela).
   */
  periods: number[];
  /** Amortiguamiento relativo (0 = rebota para siempre, 1 = sin rebote). 0.2–0.4 se ve vivo. */
  damping: number;
  /** Gravedad en unidades/frame² (positivo = hacia abajo). */
  gravity: number;
  /** Cuánto afecta la aceleración del cuerpo (1 = barra física real). */
  inertia: number;
  /** Desvío máximo de cada tramo respecto de su pose (grados). Evita pliegues imposibles. */
  maxDeviation: number;
  substeps: number;
};

/** Lo que mueve a la cadena en cada frame: su base, el ángulo de la base y una curvatura extra. */
export type ChainDriver = { base: Vec; angle: number; curl?: number };

const DEG = 180 / Math.PI;

/**
 * Cadena con inercia basada en RESORTES ANGULARES.
 * Cada tramo tiene su ángulo absoluto con velocidad propia y es atraído a su
 * pose (relativa al tramo padre) por un resorte amortiguado. La aceleración de
 * su punto de apoyo lo hace "quedarse atrás" como una barra real, así surgen
 * solos el seguimiento (follow-through) y el solapamiento entre tramos.
 * Es estable y permite elegir el ritmo de cada parte en frames.
 */
export class ChainSim {
  private phi: number[] = [];
  private omega: number[] = [];
  private pivots: Vec[] = [];
  private vel: Vec[] = [];
  private last?: ChainDriver;

  constructor(private readonly params: ChainParams) {}

  private fk(base: Vec): Vec[] {
    const pts = [base];
    for (let i = 0; i < this.phi.length; i++) pts.push(add(pts[i], mul(dir(this.phi[i]), this.params.shape.lengths[i])));
    return pts;
  }

  private targets(baseAngle: number, curl: number): number[] {
    const { relAngles } = this.params.shape;
    return this.phi.map((_, i) => (i === 0 ? baseAngle + relAngles[0] : this.phi[i - 1] + relAngles[i] + curl));
  }

  step(d: ChainDriver): Vec[] {
    if (!this.last) {
      // Pose inicial = pose de reposo, luego asentar con gravedad.
      const { relAngles } = this.params.shape;
      let a = d.angle;
      this.phi = relAngles.map((r, i) => (a += r + (i > 0 ? d.curl ?? 0 : 0)));
      this.omega = this.phi.map(() => 0);
      this.pivots = this.fk(d.base);
      this.vel = this.pivots.map(() => ({ x: 0, y: 0 }));
      this.last = d;
      for (let i = 0; i < 90; i++) this.integrate(d, d);
      this.omega = this.phi.map(() => 0);
      this.vel = this.pivots.map(() => ({ x: 0, y: 0 }));
      return this.fk(d.base);
    }
    this.integrate(this.last, d);
    this.last = d;
    return this.fk(d.base);
  }

  private integrate(from: ChainDriver, to: ChainDriver): void {
    const { shape, periods, damping, gravity, inertia, maxDeviation, substeps } = this.params;
    const dt = 1 / substeps;
    for (let s = 1; s <= substeps; s++) {
      const t = s / substeps;
      const base = lerpVec(from.base, to.base, t);
      const angle = mix(from.angle, to.angle, t);
      const curl = mix(from.curl ?? 0, to.curl ?? 0, t);

      // Aceleración de la base (el cuerpo): todos los tramos la sienten.
      // (Usar la aceleración de cada articulación crea una realimentación
      // caótica, como un péndulo múltiple; el retraso entre tramos ya surge
      // porque cada uno persigue el ángulo de su padre con su propia inercia.)
      const v = mul(sub(base, this.pivots[0]), 1 / dt);
      const accBase = mul(sub(v, this.vel[0]), 1 / dt);
      this.vel[0] = v;
      this.pivots[0] = base;
      const acc = this.phi.map(() => accBase);

      const tg = this.targets(angle, curl);
      for (let i = 0; i < this.phi.length; i++) {
        const w = (2 * Math.PI) / periods[i];
        const k = w * w;
        const c = 2 * damping * w;
        const err = angleDelta(this.phi[i], tg[i]);
        const L = shape.lengths[i];
        const n = perpRight(dir(this.phi[i]));
        // Aceleración efectiva = aceleración del apoyo − gravedad.
        const ax = acc[i].x;
        const ay = acc[i].y - gravity;
        const inertial = (-(1.5 * inertia) / L) * (ax * n.x + ay * n.y) * DEG;
        const alpha = k * err - c * this.omega[i] + inertial;
        this.omega[i] += alpha * dt;
        this.phi[i] += this.omega[i] * dt;
        // Límite de deformación
        const dev = angleDelta(tg[i], this.phi[i]);
        if (Math.abs(dev) > maxDeviation) {
          this.phi[i] = tg[i] + clamp(dev, -maxDeviation, maxDeviation);
          this.omega[i] *= 0.5;
        }
        // Los hijos usan el ángulo ya actualizado del padre.
        if (i + 1 < this.phi.length) tg[i + 1] = this.phi[i] + shape.relAngles[i + 1] + curl;
      }
    }
  }
}

/**
 * Ejecuta una simulación por frames de forma determinista y la guarda en caché.
 * Remotion puede pedir los frames en cualquier orden (o en paralelo en otros
 * procesos): siempre se simula desde el frame 0, así el resultado es idéntico.
 */
export const cachedSimulation = <T>(stepFrame: (frame: number) => T): ((frame: number) => T) => {
  const results: T[] = [];
  return (frame: number) => {
    const f = Math.max(0, Math.floor(frame));
    for (let i = results.length; i <= f; i++) results.push(stepFrame(i));
    return results[f];
  };
};
