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

/** Ojo con iris ámbar, brillo y párpado. */
const Eye: React.FC<{
  cx: number;
  cy: number;
  blink: number;
  lookX: number;
  lookY: number;
  wide: boolean;
  closedHappy: boolean;
}> = ({ cx, cy, blink, lookX, lookY, wide, closedHappy }) => {
  const rx = 48;
  const ry = wide ? 62 : 56;
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
  const irisR = wide ? 34 : 36;
  return (
    <g transform={`translate(${cx} ${cy}) scale(1 ${open}) translate(${-cx} ${-cy})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.eyeWhite} stroke={C.outline} strokeWidth={4} />
      <circle cx={px} cy={py} r={irisR} fill="url(#tito-iris)" />
      <circle cx={px} cy={py + 2} r={wide ? 15 : 19} fill={C.pupil} />
      <circle cx={px + 12} cy={py - 14} r={10} fill="#FFFFFF" />
      <circle cx={px - 11} cy={py + 13} r={5} fill="#FFFFFF" opacity={0.85} />
    </g>
  );
};

/**
 * TITO — personaje principal de UNIVERSO TITO, dibujado 100% en SVG vectorial.
 * Cada parte (orejas, ojos, boca, brazos, cola, bufanda) es animable por props,
 * de modo que su apariencia es idéntica en todos los episodios.
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

  const width = (height * TITO_VIEWBOX.width) / TITO_VIEWBOX.height;
  const sx = 1 + squash * 0.18;
  const sy = 1 - squash * 0.18;
  const bodyBreath = 1 + breath * 0.025;
  const wide = expression === "sorpresa";
  const mouth = Math.max(0, Math.min(1, mouthOpen));

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
      </defs>

      <g transform={`translate(${flip ? TITO_VIEWBOX.width : 0} 0) scale(${flip ? -1 : 1} 1)`}>
        {/* Sombra en el piso */}
        <ellipse
          cx={TITO_FEET.x}
          cy={TITO_FEET.y + 8}
          rx={170 * sx}
          ry={22}
          fill="#000"
          opacity={0.18}
        />

        {/* Aplastar/estirar anclado en los pies */}
        <g
          transform={`translate(${TITO_FEET.x} ${TITO_FEET.y}) scale(${sx} ${sy}) translate(${-TITO_FEET.x} ${-TITO_FEET.y})`}
        >
          {/* COLA (detrás del cuerpo) */}
          <g transform={`rotate(${tail} 360 640)`}>
            <path
              d="M 350 660 C 430 680 520 640 545 540 C 570 440 540 350 480 300
                 C 500 360 470 420 440 430 C 470 470 450 540 400 560 C 380 600 360 630 350 660 Z"
              fill="url(#tito-tail)"
              stroke={C.outline}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            {/* Punta crema esponjosa */}
            <path
              d="M 480 300 C 545 330 575 400 560 470 C 540 440 520 430 505 445
                 C 515 410 500 380 482 372 C 495 350 492 320 480 300 Z"
              fill={C.cream}
              stroke={C.outline}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <path d="M 430 600 C 470 590 500 560 510 520" stroke={C.furShade} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
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
          <g transform={`rotate(${armLeft} 215 530)`}>
            <path
              d="M 200 520 C 180 560 172 610 180 650 Q 186 676 210 670 Q 228 664 226 640 C 224 600 230 565 240 530 Z"
              fill={C.fur}
              stroke={C.outline}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <ellipse cx={203} cy={656} rx={24} ry={20} fill={C.paws} stroke={C.outline} strokeWidth={5} />
          </g>

          {/* BUFANDA: banda */}
          <path
            d="M 190 470 C 230 500 370 500 410 470 L 405 440 C 360 465 240 465 195 440 Z"
            fill={C.scarf}
            stroke={C.outline}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          <path d="M 205 462 C 250 482 350 482 395 462" stroke={C.scarfStripe} strokeWidth={8} fill="none" strokeLinecap="round" />

          {/* BUFANDA: punta colgante que flamea */}
          <g transform={`rotate(${scarfFlutter} 350 480)`}>
            <path
              d="M 335 470 L 395 480 C 405 520 405 560 418 595 L 372 600 C 365 560 350 520 335 470 Z"
              fill={C.scarf}
              stroke={C.outline}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <path d="M 378 590 L 384 612 M 395 590 L 402 612 M 410 590 L 418 608" stroke={C.scarfShade} strokeWidth={7} strokeLinecap="round" />
            <path d="M 350 500 L 395 505" stroke={C.scarfShade} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
          </g>

          {/* CABEZA */}
          <g transform={`translate(0 ${headBob}) rotate(${headTilt} 300 440)`}>
            {/* Orejas */}
            <g transform={`rotate(${earLeft} 200 200)`}>
              <path d="M 155 225 C 135 160 140 90 165 45 C 205 80 245 130 260 175 Z" fill={C.fur} stroke={C.outline} strokeWidth={5} strokeLinejoin="round" />
              <path d="M 175 190 C 168 150 170 115 180 90 C 205 115 225 145 235 170 Z" fill={C.earInner} />
              <path d="M 165 45 C 160 60 158 72 160 85 L 180 75 Z" fill={C.paws} />
            </g>
            <g transform={`rotate(${earRight} 400 200)`}>
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

            {/* Máscara crema (hocico y mejillas) */}
            <path
              d="M 135 345 C 170 330 220 320 255 345 C 275 360 290 345 300 335
                 C 310 345 325 360 345 345 C 380 320 430 330 465 345
                 C 450 395 410 455 300 462 C 190 455 150 395 135 345 Z"
              fill={C.cream}
            />

            {/* Cejas */}
            {expression !== "guino" && (
              <>
                <path
                  d={wide ? "M 195 205 Q 230 185 265 200" : expression === "curioso" ? "M 195 222 Q 230 200 265 212" : "M 195 220 Q 230 208 265 218"}
                  stroke={C.outline}
                  strokeWidth={8}
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={wide ? "M 335 200 Q 370 185 405 205" : expression === "curioso" ? "M 335 225 Q 370 218 405 228" : "M 335 218 Q 370 208 405 220"}
                  stroke={C.outline}
                  strokeWidth={8}
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}

            {/* Ojos */}
            <Eye cx={232} cy={282} blink={blink} lookX={lookX} lookY={lookY} wide={wide} closedHappy={false} />
            <Eye cx={368} cy={282} blink={blink} lookX={lookX} lookY={lookY} wide={wide} closedHappy={expression === "guino"} />

            {/* Cachetes */}
            <ellipse cx={180} cy={370} rx={30} ry={18} fill={C.blush} opacity={0.55} />
            <ellipse cx={420} cy={370} rx={30} ry={18} fill={C.blush} opacity={0.55} />

            {/* Nariz */}
            <path d="M 278 360 Q 300 350 322 360 Q 318 382 300 388 Q 282 382 278 360 Z" fill={C.nose} />
            <ellipse cx={292} cy={362} rx={7} ry={4} fill="#FFFFFF" opacity={0.7} />

            {/* Boca */}
            {mouth < 0.08 ? (
              <path
                d="M 262 400 Q 280 418 300 400 Q 320 418 338 400"
                stroke={C.outline}
                strokeWidth={7}
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <g>
                <path
                  d={`M 262 398 Q 300 ${404 + mouth * 62} 338 398 Q 300 ${396 + mouth * 8} 262 398 Z`}
                  fill={C.mouth}
                  stroke={C.outline}
                  strokeWidth={6}
                  strokeLinejoin="round"
                />
                <ellipse cx={300} cy={398 + mouth * 40} rx={18 + mouth * 6} ry={6 + mouth * 9} fill={C.tongue} />
              </g>
            )}
          </g>

          {/* BRAZO DERECHO (saluda). Pivote en el hombro. */}
          <g transform={`rotate(${armRight} 385 530)`}>
            <path
              d="M 360 530 C 370 565 376 600 374 640 Q 372 664 390 670 Q 414 676 420 650 C 428 610 420 560 400 520 Z"
              fill={C.fur}
              stroke={C.outline}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <ellipse cx={397} cy={656} rx={24} ry={20} fill={C.paws} stroke={C.outline} strokeWidth={5} />
          </g>
        </g>
      </g>
    </svg>
  );
};
