import React from "react";
import { TITO_COLORS as C, TITO_FEET, TITO_VIEWBOX, TitoExpression } from "./design";

/**
 * Pose de Tito en un frame. Todos los valores son numéricos para poder
 * animarlos con interpolate()/spring(). Ninguno es obligatorio.
 */
export type TitoPose = {
  /** 0 = ojos abiertos, 1 = cerrados. */
  blink?: number;
  /** 0 = boca cerrada (sonrisa), 1 = totalmente abierta. */
  mouthOpen?: number;
  /** Dirección de la mirada, -1..1 en cada eje. */
  lookX?: number;
  lookY?: number;
  /** Rotación del brazo derecho en grados (0 = colgando, -150 = arriba saludando). */
  armRight?: number;
  /** Rotación del brazo izquierdo en grados (0 = colgando, positivo = hacia afuera). */
  armLeft?: number;
  /**
   * Flexión de los codos en grados (positivo = el antebrazo se dobla hacia
   * el cuerpo). Si no se indica, se calcula sola según la posición del brazo.
   */
  elbowRight?: number;
  elbowLeft?: number;
  /** Balanceo de la cola en grados. */
  tail?: number;
  /** Inclinación de la cabeza en grados. */
  headTilt?: number;
  /** Desplazamiento vertical de la cabeza (respiración / rebote). */
  headBob?: number;
  /** Movimiento de cada oreja en grados. */
  earLeft?: number;
  earRight?: number;
  /** Aplastar/estirar: positivo aplasta (aterrizaje), negativo estira (salto). */
  squash?: number;
  /** Respiración 0..1 (escala muy sutil del cuerpo). */
  breath?: number;
  /** Ondulación de la punta de la bufanda en grados. */
  scarfFlutter?: number;
  expression?: TitoExpression;
};

export type TitoProps = {
  pose?: TitoPose;
  /** Alto en píxeles del personaje en pantalla. */
  height?: number;
  /** Mirar hacia la izquierda (espejo). */
  flip?: boolean;
  style?: React.CSSProperties;
};

type Pt = readonly [number, number, number?];

/**
 * Contorno "peludo": une los puntos con curvas que se abomban hacia afuera
 * (el tercer valor de cada punto es cuánto se abomba el tramo que sale de él).
 * Las uniones entre curvas forman puntitas, como mechones de pelo.
 * Los puntos deben ir en sentido antihorario en pantalla.
 */
const furPath = (pts: readonly Pt[], closed = true): string => {
  const n = pts.length;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const [ax, ay, bulge = 0] = pts[i];
    const [bx, by] = pts[(i + 1) % n];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const cx = (ax + bx) / 2 - (dy / len) * bulge;
    const cy = (ay + by) / 2 + (dx / len) * bulge;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${bx} ${by}`;
  }
  return closed ? `${d} Z` : d;
};

// ── COLA ─────────────────────────────────────────────────────────────
// Contorno completo de la cola (desde la cadera, por afuera hasta la punta y de vuelta).
const TAIL_OUTLINE: Pt[] = [
  [350, 700, 10],
  [450, 714, 24],
  [540, 674, 24],
  [592, 600, 22],
  [614, 515, 20],
  [612, 430, 20],
  [592, 350, 18],
  [554, 284, 18],
  [502, 238, 14],
  [452, 224, 14],
  [470, 282, 14],
  [452, 342, 14],
  [440, 410, 12],
  [425, 482, 12],
  [400, 556, 10],
  [372, 628, 8],
];
// Punta crema: comparte el borde exterior y termina en mechones en zigzag.
const TAIL_TIP: Pt[] = [
  [612, 430, 20],
  [592, 350, 18],
  [554, 284, 18],
  [502, 238, 14],
  [452, 224, 14],
  [470, 282, 14],
  [452, 342, 14],
  [440, 410, 4],
  [476, 386, 4],
  [506, 428, 4],
  [542, 396, 4],
  [576, 440, 4],
];

/** Divide cada tramo en dos para que el contorno tenga más mechones. */
const moreTufts = (pts: readonly Pt[]): Pt[] =>
  pts.flatMap(([x, y, b = 0], i) => {
    const [nx, ny] = pts[(i + 1) % pts.length];
    return [
      [x, y, b * 0.75],
      [(x + nx) / 2, (y + ny) / 2, b * 0.75],
    ] as Pt[];
  });

const TAIL_PATH = furPath(moreTufts(TAIL_OUTLINE));
const TAIL_TIP_PATH = furPath(moreTufts(TAIL_TIP));

const Tail: React.FC = () => {
  const outline = TAIL_PATH;
  return (
    <g>
      <path d={outline} fill="url(#tito-tail)" />
      <path d={TAIL_TIP_PATH} fill={C.cream} />
      {/* Mechones interiores (volumen) */}
      <g fill="none" strokeLinecap="round">
        <path d="M 392 650 Q 470 620 530 540" stroke={C.furShade} strokeWidth={7} opacity={0.55} />
        <path d="M 445 600 Q 520 560 568 470" stroke={C.furShade} strokeWidth={6} opacity={0.45} />
        <path d="M 430 520 Q 470 480 492 440" stroke={C.furLight} strokeWidth={6} opacity={0.7} />
        <path d="M 498 300 Q 538 318 560 362" stroke={C.creamShade} strokeWidth={6} />
        <path d="M 478 262 Q 500 268 516 286" stroke={C.creamShade} strokeWidth={5} />
      </g>
      <path d={outline} fill="none" stroke={C.outline} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

// ── OJOS ─────────────────────────────────────────────────────────────
type EyeVariant = "normal" | "wide" | "inquisitive";

/** Ojo con iris ámbar, brillo y párpados según la expresión. */
const Eye: React.FC<{
  id: string;
  cx: number;
  cy: number;
  blink: number;
  lookX: number;
  lookY: number;
  variant: EyeVariant;
  closedHappy: boolean;
}> = ({ id, cx, cy, blink, lookX, lookY, variant, closedHappy }) => {
  const big = variant === "wide" || variant === "inquisitive";
  const rx = variant === "inquisitive" ? 51 : 48;
  const ry = big ? 62 : 56;
  const open = Math.max(0, 1 - blink);
  if (closedHappy || open < 0.12) {
    // Ojo cerrado: arco de felicidad "^"
    return (
      <path
        d={`M ${cx - 38} ${cy + 8} Q ${cx} ${cy - 30} ${cx + 38} ${cy + 8}`}
        stroke={C.pupil}
        strokeWidth={11}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  const px = cx + lookX * 14;
  const py = cy + 4 + lookY * 12;
  const irisR = variant === "wide" ? 34 : 36;
  const pupilR = variant === "wide" ? 15 : variant === "inquisitive" ? 17 : 19;
  const clipId = `tito-eye-${id}`;
  return (
    <g transform={`translate(${cx} ${cy}) scale(1 ${open}) translate(${-cx} ${-cy})`}>
      <defs>
        <clipPath id={clipId}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.eyeWhite} />
      <g clipPath={`url(#${clipId})`}>
        <circle cx={px} cy={py} r={irisR} fill="url(#tito-iris)" />
        <circle cx={px} cy={py + 2} r={pupilR} fill={C.pupil} />
        <circle cx={px + 12} cy={py - 14} r={10} fill="#FFFFFF" />
        <circle cx={px - 11} cy={py + 13} r={5} fill="#FFFFFF" opacity={0.85} />
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={C.outline} strokeWidth={4} />
    </g>
  );
};

// ── BRAZOS ───────────────────────────────────────────────────────────
const UPPER_ARM = 66;
const FOREARM = 60;

/**
 * Brazo de dos segmentos (brazo + antebrazo) con hombro y codo sin costuras.
 * Se dibuja apuntando hacia abajo en coordenadas locales; el brazo izquierdo
 * es el espejo del derecho.
 */
const Arm: React.FC<{ side: "left" | "right"; angle: number; elbow: number }> = ({ side, angle, elbow }) => {
  const right = side === "right";
  const pivotX = right ? 385 : 215;
  // Ángulo local (en el espacio espejado del brazo izquierdo los giros se invierten).
  const shoulder = right ? angle - 6 : -(angle + 6);
  return (
    <g transform={`translate(${pivotX} 530) scale(${right ? 1 : -1} 1) rotate(${shoulder})`}>
      {/* Brazo */}
      <rect x={-22} y={-16} width={44} height={UPPER_ARM + 26} rx={22} fill={C.fur} stroke={C.outline} strokeWidth={5} />
      {/* Antebrazo + mano */}
      <g transform={`translate(0 ${UPPER_ARM}) rotate(${elbow})`}>
        <rect x={-20} y={-14} width={40} height={FOREARM + 8} rx={20} fill={C.fur} stroke={C.outline} strokeWidth={5} />
        {/* Codo: tapa las líneas internas para que la articulación sea continua */}
        <circle cx={0} cy={0} r={17} fill={C.fur} />
        <path d="M 12 4 Q 15 22 12 40" stroke={C.furShade} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
        {/* Mano con deditos */}
        <g transform={`translate(0 ${FOREARM})`}>
          <ellipse cx={0} cy={0} rx={26} ry={23} fill={C.paws} stroke={C.outline} strokeWidth={5} />
          <ellipse cx={-21} cy={-6} rx={10} ry={12} fill={C.paws} stroke={C.outline} strokeWidth={4} />
          <path d="M -6 10 L -6 20 M 6 10 L 6 20" stroke="#4A2612" strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={4} cy={-8} rx={8} ry={5} fill="#FFFFFF" opacity={0.18} />
        </g>
      </g>
      {/* Hombro: tapa la costura con el cuerpo */}
      <circle cx={-3} cy={0} r={18} fill={C.fur} />
    </g>
  );
};

// ── BUFANDA ──────────────────────────────────────────────────────────
const bandTop = (x: number) => {
  const t = (x - 178) / 244;
  return 452 + 3 * t * (1 - t) * 46;
};
const bandBottom = (x: number) => {
  const t = (x - 172) / 256;
  return 488 + 3 * t * (1 - t) * 52;
};

const ScarfBand: React.FC = () => (
  <g>
    <path
      d="M 178 452 C 225 498 375 498 422 452 L 428 488 C 380 540 220 540 172 488 Z"
      fill={C.scarf}
      stroke={C.outline}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    {/* Tejido acanalado */}
    {[200, 222, 244, 266, 288, 310, 332, 354, 376, 398].map((x) => (
      <path key={x} d={`M ${x} ${bandTop(x) + 7} L ${x} ${bandBottom(x) - 7}`} stroke={C.scarfShade} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
    ))}
    <path d="M 182 471 C 228 519 372 519 418 471" stroke={C.scarfStripe} strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

const ScarfEnd: React.FC<{ flutter: number }> = ({ flutter }) => (
  <g transform={`rotate(${flutter} 330 505)`}>
    <path
      d="M 306 512 C 308 560 308 600 304 642 L 360 644 C 362 598 358 552 352 506 Z"
      fill={C.scarf}
      stroke={C.outline}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path d="M 308 584 L 359 586" stroke={C.scarfStripe} strokeWidth={9} />
    <path d="M 307 606 L 360 608" stroke={C.scarfStripe} strokeWidth={9} />
    <path d="M 340 520 C 344 560 344 600 342 636" stroke={C.scarfShade} strokeWidth={4} fill="none" opacity={0.5} />
    <path d="M 312 644 L 310 666 M 324 645 L 323 668 M 337 645 L 337 668 M 350 645 L 352 666" stroke={C.scarfShade} strokeWidth={7} strokeLinecap="round" />
    {/* Nudo */}
    <ellipse cx={330} cy={506} rx={30} ry={22} fill={C.scarf} stroke={C.outline} strokeWidth={5} />
    <path d="M 312 504 Q 330 516 348 504" stroke={C.scarfShade} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

// ── CARA ─────────────────────────────────────────────────────────────
const BROWS: Record<TitoExpression, [string, string]> = {
  feliz: ["M 195 214 Q 230 196 265 210", "M 335 210 Q 370 196 405 214"],
  sorpresa: ["M 195 205 Q 230 185 265 200", "M 335 200 Q 370 185 405 205"],
  // Curioso: una ceja baja y una bien alta (asimétricas)
  curioso: ["M 195 226 Q 232 216 267 226", "M 332 192 Q 370 162 408 186"],
  guino: ["", ""],
};

const Mouth: React.FC<{ open: number; expression: TitoExpression }> = ({ open, expression }) => {
  if (open >= 0.08) {
    return (
      <g>
        <path
          d={`M 264 410 Q 300 ${416 + open * 62} 336 410 Q 300 ${408 + open * 8} 264 410 Z`}
          fill={C.mouth}
          stroke={C.outline}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <ellipse cx={300} cy={410 + open * 40} rx={17 + open * 6} ry={5 + open * 9} fill={C.tongue} />
      </g>
    );
  }
  if (expression === "curioso") {
    // Boquita en "o" corrida hacia un costado
    return (
      <g>
        <path d="M 300 398 L 302 410" stroke={C.outline} strokeWidth={6} strokeLinecap="round" />
        <ellipse cx={312} cy={422} rx={10} ry={12} fill={C.mouth} stroke={C.outline} strokeWidth={5} />
      </g>
    );
  }
  if (expression === "sorpresa") {
    return <ellipse cx={300} cy={420} rx={14} ry={17} fill={C.mouth} stroke={C.outline} strokeWidth={5} />;
  }
  // Feliz / guiño: sonrisa amplia con hoyuelos
  return (
    <g fill="none" stroke={C.outline} strokeLinecap="round">
      <path d="M 300 398 L 300 408" strokeWidth={6} />
      <path d="M 262 404 Q 300 440 338 404" strokeWidth={7} />
      <path d="M 256 398 Q 260 404 264 406 M 344 398 Q 340 404 336 406" strokeWidth={5} />
    </g>
  );
};

/**
 * TITO — personaje principal de UNIVERSO TITO, dibujado 100% en SVG vectorial.
 * Versión de diseño 2 (ver design.ts). Cada parte (orejas, ojos, boca, brazos
 * con codos, cola, bufanda) es animable por props, de modo que su apariencia
 * es idéntica en todos los episodios.
 */
export const Tito: React.FC<TitoProps> = ({ pose = {}, height = 820, flip = false, style }) => {
  const {
    blink = 0,
    mouthOpen = 0,
    lookX = 0,
    lookY = 0,
    armRight = 0,
    armLeft = 0,
    tail = 0,
    headTilt = 0,
    headBob = 0,
    earLeft = 0,
    earRight = 0,
    squash = 0,
    breath = 0,
    scarfFlutter = 0,
    expression = "feliz",
  } = pose;
  // Codos automáticos: leve flexión en reposo, más flexión al levantar el brazo.
  const elbowRight = pose.elbowRight ?? 8 + Math.max(0, -armRight) * 0.18;
  const elbowLeft = pose.elbowLeft ?? 8 + Math.max(0, armLeft) * 0.18;

  const width = (height * TITO_VIEWBOX.width) / TITO_VIEWBOX.height;
  const sx = 1 + squash * 0.18;
  const sy = 1 - squash * 0.18;
  const bodyBreath = 1 + breath * 0.025;
  const mouth = Math.max(0, Math.min(1, mouthOpen));

  // Rasgos propios de cada expresión
  const curious = expression === "curioso";
  const eyeLeft: EyeVariant = expression === "sorpresa" ? "wide" : "normal";
  const eyeRight: EyeVariant = expression === "sorpresa" ? "wide" : curious ? "inquisitive" : "normal";
  const earL = earLeft + (curious ? -10 : 0);
  const earR = earRight + (curious ? -6 : 0);
  const [browL, browR] = BROWS[expression];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${TITO_VIEWBOX.width} ${TITO_VIEWBOX.height}`}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <radialGradient id="tito-iris" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FFD27A" />
          <stop offset="55%" stopColor={C.iris} />
          <stop offset="100%" stopColor={C.irisDark} />
        </radialGradient>
        <radialGradient id="tito-fur" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor={C.furLight} />
          <stop offset="60%" stopColor={C.fur} />
          <stop offset="100%" stopColor={C.furShade} />
        </radialGradient>
        <linearGradient id="tito-tail" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={C.furShade} />
          <stop offset="50%" stopColor={C.fur} />
          <stop offset="100%" stopColor={C.furLight} />
        </linearGradient>
        <radialGradient id="tito-snout" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFF7E8" />
          <stop offset="70%" stopColor={C.cream} />
          <stop offset="100%" stopColor={C.creamShade} />
        </radialGradient>
      </defs>

      <g transform={`translate(${flip ? TITO_VIEWBOX.width : 0} 0) scale(${flip ? -1 : 1} 1)`}>
        {/* Sombra en el piso */}
        <ellipse cx={TITO_FEET.x} cy={TITO_FEET.y + 8} rx={170 * sx} ry={22} fill="#000" opacity={0.18} />

        {/* Aplastar/estirar anclado en los pies */}
        <g
          transform={`translate(${TITO_FEET.x} ${TITO_FEET.y}) scale(${sx} ${sy}) translate(${-TITO_FEET.x} ${-TITO_FEET.y})`}
        >
          {/* COLA (detrás del cuerpo) */}
          <g transform={`rotate(${tail} 360 640)`}>
            <Tail />
          </g>

          {/* PIERNAS Y PATAS */}
          <path d="M 228 700 L 222 760 Q 222 790 262 790 L 282 790 Q 300 790 296 760 L 290 700 Z" fill={C.paws} stroke={C.outline} strokeWidth={5} />
          <path d="M 310 700 L 304 760 Q 300 790 318 790 L 338 790 Q 378 790 378 760 L 372 700 Z" fill={C.paws} stroke={C.outline} strokeWidth={5} />

          {/* CUERPO */}
          <g transform={`translate(300 720) scale(${bodyBreath} ${bodyBreath}) translate(-300 -720)`}>
            <path
              d="M 300 470 C 395 470 420 560 415 640 C 410 715 365 740 300 740
                 C 235 740 190 715 185 640 C 180 560 205 470 300 470 Z"
              fill="url(#tito-fur)"
              stroke={C.outline}
              strokeWidth={5}
            />
            {/* Pecho crema */}
            <path
              d="M 300 500 C 355 510 365 580 358 640 C 352 690 330 715 300 715
                 C 270 715 248 690 242 640 C 235 580 245 510 300 500 Z"
              fill={C.cream}
            />
          </g>

          {/* BRAZO IZQUIERDO (del espectador) */}
          <Arm side="left" angle={armLeft} elbow={elbowLeft} />

          {/* BUFANDA: banda alrededor del cuello */}
          <ScarfBand />

          {/* CABEZA */}
          <g transform={`translate(0 ${headBob}) rotate(${headTilt} 300 440)`}>
            {/* Orejas */}
            <g transform={`rotate(${earL} 200 200)`}>
              <path d="M 155 225 C 135 160 140 90 165 45 C 205 80 245 130 260 175 Z" fill={C.fur} stroke={C.outline} strokeWidth={5} strokeLinejoin="round" />
              <path d="M 175 190 C 168 150 170 115 180 90 C 205 115 225 145 235 170 Z" fill={C.earInner} />
              <path d="M 165 45 C 160 60 158 72 160 85 L 180 75 Z" fill={C.paws} />
            </g>
            <g transform={`rotate(${earR} 400 200)`}>
              <path d="M 445 225 C 465 160 460 90 435 45 C 395 80 355 130 340 175 Z" fill={C.fur} stroke={C.outline} strokeWidth={5} strokeLinejoin="round" />
              <path d="M 425 190 C 432 150 430 115 420 90 C 395 115 375 145 365 170 Z" fill={C.earInner} />
              <path d="M 435 45 C 440 60 442 72 440 85 L 420 75 Z" fill={C.paws} />
            </g>

            {/* Forma de la cabeza con mechones en las mejillas */}
            <path
              d="M 300 150 C 400 150 470 210 478 300 C 482 340 470 365 500 395
                 C 460 400 450 410 440 430 C 400 465 350 470 300 470
                 C 250 470 200 465 160 430 C 150 410 140 400 100 395
                 C 130 365 118 340 122 300 C 130 210 200 150 300 150 Z"
              fill="url(#tito-fur)"
              stroke={C.outline}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            {/* Mechón en la frente */}
            <path d="M 280 152 C 285 175 300 185 318 180 C 310 172 308 162 312 150 Z" fill={C.furLight} />

            {/* Máscara crema de las mejillas: deja bajar el naranja por el puente del hocico */}
            <path
              d="M 135 345 C 170 330 222 322 252 342 C 268 354 278 366 282 380
                 L 318 380 C 322 366 332 354 348 342 C 378 322 430 330 465 345
                 C 450 395 410 455 300 462 C 190 455 150 395 135 345 Z"
              fill={C.cream}
            />
            {/* Puente del hocico (brillo que alarga la cara hacia la nariz) */}
            <path d="M 300 236 Q 290 300 298 362" stroke={C.furLight} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.75} />

            {/* HOCICO con volumen: sobresale hacia abajo y hacia el frente */}
            <path
              d="M 256 372 C 258 352 280 346 300 346 C 320 346 342 352 344 372
                 C 348 410 334 452 300 458 C 266 452 252 410 256 372 Z"
              fill="url(#tito-snout)"
            />
            {/* Sombra bajo el hocico (da profundidad sobre el mentón) */}
            <path d="M 262 436 Q 300 474 338 436" stroke={C.creamShade} strokeWidth={7} fill="none" strokeLinecap="round" />
            {/* Puntitos de bigotes */}
            <g fill={C.creamShade}>
              <circle cx={272} cy={392} r={3.5} />
              <circle cx={266} cy={404} r={3.5} />
              <circle cx={328} cy={392} r={3.5} />
              <circle cx={334} cy={404} r={3.5} />
            </g>

            {/* Cejas */}
            {browL && <path d={browL} stroke={C.outline} strokeWidth={8} strokeLinecap="round" fill="none" />}
            {browR && <path d={browR} stroke={C.outline} strokeWidth={8} strokeLinecap="round" fill="none" />}

            {/* Ojos */}
            <Eye id="l" cx={232} cy={282} blink={blink} lookX={lookX} lookY={lookY} variant={eyeLeft} closedHappy={false} />
            <Eye id="r" cx={368} cy={282} blink={blink} lookX={lookX} lookY={lookY} variant={eyeRight} closedHappy={expression === "guino"} />

            {/* Cachetes */}
            <ellipse cx={180} cy={370} rx={30} ry={18} fill={C.blush} opacity={0.55} />
            <ellipse cx={420} cy={370} rx={30} ry={18} fill={C.blush} opacity={0.55} />

            {/* Nariz (más grande, en la punta del hocico) */}
            <path d="M 272 370 Q 300 356 328 370 Q 324 392 300 400 Q 276 392 272 370 Z" fill={C.nose} />
            <ellipse cx={290} cy={370} rx={9} ry={5} fill="#FFFFFF" opacity={0.7} />

            {/* Boca */}
            <Mouth open={mouth} expression={expression} />
          </g>

          {/* BUFANDA: punta colgante con nudo (delante del pecho) */}
          <ScarfEnd flutter={scarfFlutter} />

          {/* BRAZO DERECHO (saluda) */}
          <Arm side="right" angle={armRight} elbow={elbowRight} />
        </g>
      </g>
    </svg>
  );
};
