/**
 * Resorte amortiguado 1D (oscilador armónico) integrado en sub-pasos.
 * Útil para "rebotes" secundarios: orejas, cachetes, pequeños sacudones.
 */
export class Spring1D {
  value = 0;
  velocity = 0;
  constructor(
    /** Período natural en frames. */
    private readonly period: number,
    /** Amortiguamiento relativo (0..1). */
    private readonly damping: number,
    private readonly substeps = 4,
  ) {}

  /** Avanza un frame: `target` es el reposo, `force` una aceleración externa (unidades/frame²). */
  step(target: number, force = 0): number {
    const w = (2 * Math.PI) / this.period;
    const dt = 1 / this.substeps;
    for (let i = 0; i < this.substeps; i++) {
      const a = w * w * (target - this.value) - 2 * this.damping * w * this.velocity + force;
      this.velocity += a * dt;
      this.value += this.velocity * dt;
    }
    return this.value;
  }
}
