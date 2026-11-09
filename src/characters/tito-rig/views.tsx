import React, { useId } from "react";
import { Vec, vec } from "../../rig/math";
import { TITO_COLORS as C, TITO_FEET, TITO_VIEWBOX } from "../tito/design";
import { Arm, Leg, ScarfBand, ScarfEnd, spineOutline, Tail } from "./body";
import { kinematicChain, SCARF, TAIL_REST_POINTS } from "./chains";
import { REST } from "./channels";
import { Brow, Eye } from "./head";
import { solveSkeleton } from "./skeleton";

/**
 * VISTAS GIRADAS DE TITO (tres cuartos y perfil), mirando hacia la derecha.
 * Mismo lienzo (600×820, pies en y=790), mismas alturas de referencia
 * (orejas, ojos, mentón, panza, pies), mismos colores y piezas que el frente.
 * Para mirar a la izquierda se usan en espejo.
 *
 * REFERENCIA OFICIAL: docs/referencias/tito-giro-oficial.png (ficha "TitoGiro").
 * Cualquier cambio en estas vistas debe mantener la coherencia descrita en
 * docs/referencias/README.md.
 */

const OUTLINE = 5;
const sk = solveSkeleton(REST);

const Defs: React.FC<{ uid: string }> = ({ uid }) => (
  <defs>
    <radialGradient id={`${uid}-iris`} cx="45%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#FFD27A" />
      <stop offset="55%" stopColor={C.iris} />
      <stop offset="100%" stopColor={C.irisDark} />
    </radialGradient>
    <radialGradient id={`${uid}-fur`} gradientUnits="userSpaceOnUse" cx={270} cy={500} r={330}>
      <stop offset="0%" stopColor={C.furLight} />
      <stop offset="62%" stopColor={C.fur} />
      <stop offset="100%" stopColor={C.furShade} />
    </radialGradient>
    <radialGradient id={`${uid}-head`} gradientUnits="userSpaceOnUse" cx={290} cy={246} r={300}>
      <stop offset="0%" stopColor={C.furLight} />
      <stop offset="60%" stopColor={C.fur} />
      <stop offset="100%" stopColor={C.furShade} />
    </radialGradient>
    <linearGradient id={`${uid}-tail`} x1="1" y1="1" x2="0" y2="0">
      <stop offset="0%" stopColor={C.furShade} />
      <stop offset="50%" stopColor={C.fur} />
      <stop offset="100%" stopColor={C.furLight} />
    </linearGradient>
    <radialGradient id={`${uid}-snout`} cx="45%" cy="35%" r="75%">
      <stop offset="0%" stopColor="#FFF7E8" />
      <stop offset="70%" stopColor={C.cream} />
      <stop offset="100%" stopColor={C.creamShade} />
    </radialGradient>
  </defs>
);

const Shadow: React.FC<{ rx?: number }> = ({ rx = 160 }) => <ellipse cx={TITO_FEET.x} cy={TITO_FEET.y + 8} rx={rx} ry={22} fill="#000" opacity={0.18} />;

/** Cola espejada (sale por la espalda, hacia la izquierda), desplazada. */
const backTail = (dx: number, dy = 0): Vec[] => TAIL_REST_POINTS.map((p) => vec(600 - p.x + dx, p.y + dy));

const Svg: React.FC<{ height: number; flip?: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({ height, flip, style, children }) => {
  const width = (height * TITO_VIEWBOX.width) / TITO_VIEWBOX.height;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${TITO_VIEWBOX.width} ${TITO_VIEWBOX.height}`} style={{ overflow: "visible", ...style }}>
      <g transform={flip ? `translate(${TITO_VIEWBOX.width} 0) scale(-1 1)` : undefined}>{children}</g>
    </svg>
  );
};

const Ear: React.FC<{ transform: string; narrow?: number }> = ({ transform, narrow = 1 }) => (
  <g transform={transform}>
    <g transform={`translate(200 205) scale(${narrow} 1) translate(-200 -205)`}>
      <path d="M 155 225 C 135 160 140 90 165 45 C 205 80 245 130 260 175 Z" fill={C.fur} stroke={C.outline} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d="M 175 190 C 168 150 170 115 180 90 C 205 115 225 145 235 170 Z" fill={C.earInner} />
      <path d="M 165 45 C 160 60 158 72 160 85 L 180 75 Z" fill={C.paws} />
    </g>
  </g>
);

// ═════════════════════════════ TRES CUARTOS ═════════════════════════════

const HeadThreeQuarter: React.FC<{ uid: string }> = ({ uid }) => {
  const skin = `url(#${uid}-head)`;
  return (
    <g>
      {/* Orejas: la cercana atrás a la izquierda, la lejana más angosta y corrida */}
      <Ear transform="translate(-14 2) rotate(-6 200 205)" />
      <Ear transform="translate(178 -6) rotate(10 200 205)" narrow={0.78} />

      {/* Cabeza: nuca redonda a la izquierda, hocico que se adelanta a la derecha */}
      <path
        d="M 288 150 C 388 148 452 200 464 282 C 470 318 478 342 494 360
           C 508 374 508 396 488 404 C 462 422 420 440 380 452
           C 340 465 300 470 258 468 C 214 463 176 446 152 428
           C 142 413 128 404 94 397 C 120 368 108 340 112 300
           C 118 212 188 150 288 150 Z"
        fill={skin}
        stroke={C.outline}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path d="M 300 152 C 306 172 322 182 340 176 C 330 170 328 160 330 150 Z" fill={C.furLight} />

      {/* Máscara crema: mejilla cercana grande, sigue bajo el hocico hasta la nariz */}
      <path
        d="M 126 346 C 166 330 214 324 246 344 C 270 360 296 372 330 380
           C 380 390 432 390 484 398 C 462 420 420 440 380 452
           C 340 465 300 470 258 468 C 210 462 152 420 126 346 Z"
        fill={C.cream}
      />
      {/* Puente del hocico (brillo) */}
      <path d="M 330 232 Q 360 300 452 352" stroke={C.furLight} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.7} />
      {/* Volumen del hocico */}
      <path d="M 360 380 C 400 372 450 374 486 392 C 480 420 440 446 392 450 C 360 446 344 420 360 380 Z" fill={`url(#${uid}-snout)`} />
      <path d="M 352 440 Q 390 466 440 444" stroke={C.creamShade} strokeWidth={7} fill="none" strokeLinecap="round" />
      <g fill={C.creamShade}>
        <circle cx={420} cy={404} r={3.5} />
        <circle cx={410} cy={416} r={3.5} />
        <circle cx={450} cy={406} r={3.5} />
      </g>

      {/* Ojos: el lejano escorzado (más angosto), ambos miran hacia adelante */}
      <Brow cx={236} y={214} tilt={0} side={-1} arch={12} />
      <Brow cx={372} y={212} tilt={0} side={1} arch={10} />
      <Eye id={`${uid}-l`} skin={skin} cx={238} cy={282} open={1} lower={0.12} lookX={0.55} lookY={0} pupil={1} side={-1} />
      <Eye id={`${uid}-r`} skin={skin} cx={376} cy={284} open={1} lower={0.12} lookX={0.55} lookY={0} pupil={1} side={1} rx={36} />

      {/* Cachete cercano */}
      <ellipse cx={176} cy={370} rx={30} ry={18} fill={C.blush} opacity={0.55} />
      <ellipse cx={402} cy={372} rx={18} ry={14} fill={C.blush} opacity={0.4} />

      {/* Nariz en la punta del hocico */}
      <path d="M 460 370 Q 490 356 512 372 Q 508 396 486 402 Q 464 393 460 370 Z" fill={C.nose} />
      <ellipse cx={479} cy={370} rx={9} ry={5} fill="#FFFFFF" opacity={0.7} />
      {/* Boca: surco y sonrisa debajo del hocico */}
      <path d="M 485 402 Q 481 408 471 412" stroke={C.outline} strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d="M 418 410 Q 446 434 476 410" stroke={C.outline} strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M 412 404 Q 415 411 420 413" stroke={C.outline} strokeWidth={5} strokeLinecap="round" fill="none" />
    </g>
  );
};

export const TitoThreeQuarter: React.FC<{ height?: number; flip?: boolean; style?: React.CSSProperties }> = ({ height = 820, flip, style }) => {
  const uid = `tq${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  // Brazos: el cercano (izquierda de pantalla) delante; el lejano asoma detrás del cuerpo.
  const near = { shoulder: vec(222, 532), elbow: vec(206, 596), wrist: vec(214, 654), handAngle: 172 };
  const far = { shoulder: vec(372, 528), elbow: vec(392, 590), wrist: vec(398, 648), handAngle: 184 };
  const legNear = { hip: vec(268, 712), knee: vec(262, 740), ankle: vec(266, 766), footAngle: 0 };
  const legFar = { hip: vec(340, 708), knee: vec(346, 736), ankle: vec(350, 762), footAngle: 0 };
  const knot = vec(362, 506);
  return (
    <Svg height={height} flip={flip} style={style}>
      <Defs uid={uid} />
      <Shadow rx={165} />
      <Tail chain={backTail(18)} uid={uid} />
      <Leg leg={legFar} side="R" footForward={14} shade />
      <Leg leg={legNear} side="R" footForward={14} />
      <Arm arm={far} side="L" uid={uid} />
      <path d={spineOutline(sk, "torso", { scaleL: 0.94, scaleR: 0.84, shift: 6 })} fill={`url(#${uid}-fur)`} stroke={C.outline} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={spineOutline(sk, "belly", { scaleL: 0.62, scaleR: 0.88, shift: 22 })} fill={C.cream} />
      <g transform="translate(22 6) translate(300 470) scale(0.9 1) translate(-300 -470)">
        <ScarfBand />
      </g>
      <HeadThreeQuarter uid={uid} />
      <ScarfEnd chain={kinematicChain(SCARF, knot, 2)} knotAngle={4} />
      <Arm arm={near} side="R" uid={uid} />
    </Svg>
  );
};

// ═══════════════════════════════ PERFIL ═════════════════════════════════

const HeadProfile: React.FC<{ uid: string }> = ({ uid }) => {
  const skin = `url(#${uid}-head)`;
  return (
    <g>
      {/* Orejas arriba atrás; la lejana asoma apenas adelante */}
      <Ear transform="translate(150 6) rotate(16 200 205)" narrow={0.72} />
      <Ear transform="translate(52 0) rotate(-4 200 205)" narrow={0.9} />

      {/* Cabeza de perfil: nuca a la izquierda, hocico corto y redondeado hacia la derecha */}
      <path
        d="M 262 150 C 358 150 424 192 440 254 C 448 286 452 310 468 326
           C 494 342 526 354 530 376 C 532 396 512 406 490 410
           C 456 416 428 428 398 442 C 360 458 302 468 252 466
           C 210 462 180 448 160 432 C 150 418 134 408 104 402
           C 132 380 116 350 118 300 C 122 214 180 150 262 150 Z"
        fill={skin}
        stroke={C.outline}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path d="M 268 152 C 276 172 292 180 310 174 C 300 168 298 160 300 150 Z" fill={C.furLight} />

      {/* Crema: mejilla y parte de abajo del hocico */}
      <path
        d="M 146 394 C 186 352 258 336 314 350 C 360 362 414 380 470 386
           C 488 389 498 393 504 398
           C 490 410 456 416 428 428 C 398 442 360 458 302 466
           C 252 468 196 460 160 432 C 152 420 148 408 146 394 Z"
        fill={C.cream}
      />
      {/* Puente del hocico */}
      <path d="M 368 232 Q 420 284 470 330 Q 490 342 500 346" stroke={C.furLight} strokeWidth={13} strokeLinecap="round" fill="none" opacity={0.7} />
      {/* Volumen del hocico */}
      <path d="M 396 386 C 432 382 476 386 502 398 C 490 418 460 432 424 442 C 400 436 388 412 396 386 Z" fill={`url(#${uid}-snout)`} />
      <path d="M 384 446 Q 424 462 462 440" stroke={C.creamShade} strokeWidth={7} fill="none" strokeLinecap="round" />
      <g fill={C.creamShade}>
        <circle cx={446} cy={404} r={3.5} />
        <circle cx={436} cy={416} r={3.5} />
        <circle cx={462} cy={408} r={3.5} />
      </g>

      {/* Un solo ojo, grande y algo escorzado */}
      <Brow cx={350} y={212} tilt={0} side={1} arch={12} />
      <Eye id={`${uid}-l`} skin={skin} cx={348} cy={284} open={1} lower={0.12} lookX={0.75} lookY={0} pupil={1} side={1} rx={40} />

      {/* Cachete */}
      <ellipse cx={302} cy={378} rx={30} ry={17} fill={C.blush} opacity={0.55} />

      {/* Nariz en la punta */}
      <path d="M 498 360 Q 526 350 536 370 Q 532 390 514 394 Q 496 386 498 360 Z" fill={C.nose} />
      <ellipse cx={514} cy={364} rx={8} ry={4.5} fill="#FFFFFF" opacity={0.7} />
      {/* Boca */}
      <path d="M 514 394 Q 510 402 500 406" stroke={C.outline} strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d="M 430 408 Q 466 438 502 406" stroke={C.outline} strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M 423 400 Q 426 408 433 410" stroke={C.outline} strokeWidth={5} strokeLinecap="round" fill="none" />
    </g>
  );
};

/** Banda de la bufanda vista de costado (más baja adelante) con el nudo al frente. */
const ScarfBandProfile: React.FC = () => (
  <g>
    <path
      d="M 214 446 C 262 468 330 480 396 474 L 402 516 C 330 526 258 514 214 494 C 196 486 192 456 214 446 Z"
      fill={C.scarf}
      stroke={C.outline}
      strokeWidth={OUTLINE}
      strokeLinejoin="round"
    />
    {/* La parte que gira por detrás del cuello queda en sombra */}
    <path d="M 214 449 C 199 458 199 484 214 491 C 224 494 232 497 240 500 C 234 482 234 462 240 458 C 230 455 222 452 214 449 Z" fill={C.scarfShade} opacity={0.55} />
    {[240, 264, 288, 312, 336, 360, 384].map((x, i) => (
      <path key={x} d={`M ${x} ${461 + i * 2.2} L ${x} ${497 + i * 2.6}`} stroke={C.scarfShade} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
    ))}
    <path d="M 216 470 C 262 490 326 500 398 495" stroke={C.scarfStripe} strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

export const TitoProfile: React.FC<{ height?: number; flip?: boolean; style?: React.CSSProperties }> = ({ height = 820, flip, style }) => {
  const uid = `pf${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const near = { shoulder: vec(300, 534), elbow: vec(306, 598), wrist: vec(320, 654), handAngle: 168 };
  const far = { shoulder: vec(318, 528), elbow: vec(336, 590), wrist: vec(352, 644), handAngle: 166 };
  const legNear = { hip: vec(286, 712), knee: vec(282, 740), ankle: vec(284, 766), footAngle: 0 };
  const legFar = { hip: vec(320, 710), knee: vec(322, 738), ankle: vec(326, 764), footAngle: 0 };
  const knot = vec(394, 500);
  return (
    <Svg height={height} flip={flip} style={style}>
      <Defs uid={uid} />
      <Shadow rx={150} />
      <Tail chain={backTail(-26, -4)} uid={uid} />
      <Leg leg={legFar} side="R" footForward={18} shade />
      <Leg leg={legNear} side="R" footForward={18} />
      <Arm arm={far} side="L" uid={uid} />
      <path d={spineOutline(sk, "torso", { scaleL: 0.74, scaleR: 0.84, shift: 4 })} fill={`url(#${uid}-fur)`} stroke={C.outline} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={spineOutline(sk, "belly", { scaleL: 0.4, scaleR: 0.62, shift: 48 })} fill={C.cream} />
      <ScarfBandProfile />
      <HeadProfile uid={uid} />
      <ScarfEnd chain={kinematicChain(SCARF, knot, 4)} knotAngle={10} />
      <Arm arm={near} side="R" uid={uid} />
    </Svg>
  );
};
