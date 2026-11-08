/**
 * FICHA DE DISEÑO OFICIAL DE TITO (model sheet).
 *
 * Tito es un pequeño zorro naranja: ojos grandes color ámbar, hocico y pecho
 * crema, cola muy esponjosa con punta crema y bufanda amarilla.
 *
 * ⚠️ Estos valores definen la identidad del personaje. No los modifiques en un
 * episodio: si hace falta una variante (disfraz, accesorio), agregala como prop
 * del componente <Tito/>, nunca cambiando esta ficha.
 */
export const TITO_COLORS = {
  fur: "#F28A2E",
  furShade: "#D96C1C",
  furLight: "#FFA552",
  cream: "#FFEBCB",
  creamShade: "#F3D3A6",
  paws: "#6B3A1F",
  earInner: "#FFC9A8",
  eyeWhite: "#FFFFFF",
  iris: "#F5A623",
  irisDark: "#C9741A",
  pupil: "#2B1A10",
  nose: "#2B1A10",
  mouth: "#7A2630",
  tongue: "#FF7C8A",
  blush: "#FF8C8C",
  scarf: "#FFCB2E",
  scarfShade: "#E8A800",
  scarfStripe: "#FFE680",
  outline: "#5A2C12",
} as const;

/**
 * Versión del diseño del personaje.
 * v1: diseño inicial.
 * v2: hocico con volumen, cola más grande con mechones, brazos con codo,
 *     bufanda más grande con nudo, expresiones feliz/curioso diferenciadas.
 */
export const TITO_DESIGN_VERSION = 2;

/** Dimensiones del lienzo SVG del personaje (unidades internas). */
export const TITO_VIEWBOX = { width: 600, height: 820 } as const;

/** Punto de apoyo (pies) dentro del viewBox: se usa como ancla para posicionar. */
export const TITO_FEET = { x: 300, y: 790 } as const;

export type TitoExpression = "feliz" | "sorpresa" | "curioso" | "guino";
