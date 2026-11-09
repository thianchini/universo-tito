import { add, dist, mul, norm, perpRight, sub, Vec } from "./math";

/**
 * Cinemática inversa de dos huesos (muslo + pierna, brazo + antebrazo).
 * Devuelve la posición de la articulación del medio (rodilla/codo).
 * - `bendSign` elige hacia qué lado se dobla (+1 derecha del sentido raíz→objetivo, -1 izquierda).
 * - Si el objetivo está demasiado lejos, los huesos se estiran levemente (estilo
 *   dibujo animado) en lugar de "saltar", y se devuelve el objetivo alcanzable.
 */
export const solveTwoBone = (
  root: Vec,
  target: Vec,
  l1: number,
  l2: number,
  bendSign: 1 | -1,
  maxStretch = 1.12,
): { joint: Vec; end: Vec } => {
  const d = dist(root, target);
  const reach = l1 + l2;
  let a = l1;
  let b = l2;
  let end = target;
  if (d > reach) {
    // Estirar hasta maxStretch; más allá, el pie/mano no llega.
    const s = Math.min(d / reach, maxStretch);
    a = l1 * s;
    b = l2 * s;
    if (d > reach * maxStretch) end = add(root, mul(norm(sub(target, root)), reach * maxStretch));
  }
  const dd = Math.max(1e-3, Math.min(dist(root, end), a + b - 1e-3));
  const along = (a * a - b * b + dd * dd) / (2 * dd);
  const h = Math.sqrt(Math.max(0, a * a - along * along));
  const axis = norm(sub(end, root));
  const joint = add(add(root, mul(axis, along)), mul(perpRight(axis), h * bendSign));
  return { joint, end };
};
