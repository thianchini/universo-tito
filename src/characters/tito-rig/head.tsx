import React from "react";
import { clamp, mix, smoothstep } from "../../rig/math";
import { TITO_COLORS as C } from "../tito/design";
import type { TitoChannels } from "./channels";

const OUTLINE = 5;
const f = (n: number) => n.toFixed(2);

// ── OJO ──────────────────────────────────────────────────────────────

type EyeProps = {
  id: string;
  /** Relleno del párpado (mismo degradado que la cabeza). */
  skin: string;
  cx: number;
  cy: number;
  /** Apertura efectiva 0..1.3 (ya incluye el parpadeo). */
  open: number;
  /** Párpado inferior 0..1. */
  lower: number;
  lookX: number;
  lookY: number;
  pupil: number;
  /** Lado de la cara (para que los párpados se inclinen hacia afuera). */
  side: -1 | 1;
};

/**
 * Ojo con párpados de verdad: el superior baja como una cortina curva y el
 * inferior sube con la sonrisa. Cerrado con el inferior arriba forma el "^"
 * de felicidad; cerrado sin él, una línea relajada.
 */
const Eye: React.FC<EyeProps> = ({ id, skin, cx, cy, open, lower, lookX, lookY, pupil, side }) => {
  const rx = 48;
  const wideness = Math.max(0, open - 1);
  const ry = 56 + wideness * 26;
  const o = clamp(open, 0, 1);
  const top = cy - ry;
  const bottom = cy + ry;

  // Párpado inferior (mejilla que empuja hacia arriba): borde en arco "︵".
  const low = clamp(lower, 0, 1);
  const lowY = mix(bottom + 8, cy + 4, low);
  const lift = 28 * smoothstep(low * 3.5);
  const lowerTop = lowY - lift / 2; // altura real del centro del arco

  // Borde del párpado superior: baja como una cortina hasta encontrarse con el
  // inferior. Cerrado sin sonrisa forma "◡" (relajado); con la mejilla
  // arriba forma "^" (felicidad).
  const closedY = mix(bottom - 6, lowerTop, low);
  const lidY = mix(top - 8, closedY, 1 - o);
  const sag = mix(4, 22, 1 - o);
  const arch = mix(-sag, 26 * (1 - o), smoothstep(low * 1.8)); // negativo = cuelga, positivo = arco
  const tiltOut = 6 * side * o;
  const upper = `M ${f(cx - rx - 8)} ${f(lidY + arch - tiltOut)} Q ${f(cx)} ${f(lidY - arch)} ${f(cx + rx + 8)} ${f(lidY + arch + tiltOut)}`;
  const upperFill = `${upper} L ${f(cx + rx + 8)} ${f(top - 20)} L ${f(cx - rx - 8)} ${f(top - 20)} Z`;

  const lowerLine = `M ${f(cx - rx - 8)} ${f(lowY + 6)} Q ${f(cx)} ${f(lowY - lift)} ${f(cx + rx + 8)} ${f(lowY + 6)}`;
  const lowerFill = `${lowerLine} L ${f(cx + rx + 8)} ${f(bottom + 20)} L ${f(cx - rx - 8)} ${f(bottom + 20)} Z`;

  const px = cx + lookX * 14;
  const py = cy + 4 + lookY * 13;
  const irisR = 36 - wideness * 6;
  const pupilR = 19 * pupil * (1 - wideness * 0.3);
  const clipId = `${id}-eye`;
  const showUpper = o < 0.995;
  const showLower = low > 0.005;

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>
      {o > 0.06 && <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.eyeWhite} />}
      <g clipPath={`url(#${clipId})`}>
        {o > 0.06 && <circle cx={px} cy={py} r={irisR} fill={`url(#${id.replace(/-[lr]$/, "")}-iris)`} />}
        {o > 0.06 && (
          <>
            <circle cx={px} cy={py + 2} r={pupilR} fill={C.pupil} />
            <circle cx={px + 12} cy={py - 14} r={10} fill="#FFFFFF" />
            <circle cx={px - 11} cy={py + 13} r={5} fill="#FFFFFF" opacity={0.85} />
          </>
        )}
        {showLower && <path d={lowerFill} fill={skin} />}
        {showUpper && o > 0.06 && <path d={upperFill} fill={skin} />}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={C.outline} strokeWidth={4} opacity={clamp((o - 0.12) * 5, 0, 1)} />
      {/* Líneas de párpado (recortadas al ojo para que no sobresalgan) */}
      <g clipPath={`url(#${clipId}-line)`}>
        <defs>
          <clipPath id={`${clipId}-line`}>
            <ellipse cx={cx} cy={cy} rx={rx + 3} ry={ry + 3} />
          </clipPath>
        </defs>
        {showUpper && <path d={upper} fill="none" stroke={C.pupil} strokeWidth={mix(5, 10, 1 - o)} strokeLinecap="round" />}
        {showLower && o > 0.15 && low > 0.45 && <path d={lowerLine} fill="none" stroke={C.furShade} strokeWidth={4} strokeLinecap="round" opacity={clamp((low - 0.45) * 4, 0, 0.8) * clamp((o - 0.15) * 4, 0, 1)} />}
      </g>
    </g>
  );
};

// ── CEJA ─────────────────────────────────────────────────────────────

const Brow: React.FC<{ cx: number; y: number; tilt: number; side: -1 | 1; arch: number }> = ({ cx, y, tilt, side, arch }) => {
  // side -1 = ceja izquierda (su extremo interior está a la derecha).
  const inner = { x: cx - 33 * side, y: y - tilt * 20 };
  const outer = { x: cx + 33 * side, y: y + tilt * 6 };
  const ctrl = { x: cx, y: y - arch };
  return (
    <path
      d={`M ${f(outer.x)} ${f(outer.y)} Q ${f(ctrl.x)} ${f(ctrl.y)} ${f(inner.x)} ${f(inner.y)}`}
      stroke={C.outline}
      strokeWidth={8}
      strokeLinecap="round"
      fill="none"
    />
  );
};

// ── BOCA ─────────────────────────────────────────────────────────────

/**
 * Boca continua: la misma forma pasa de línea (cerrada) a boca abierta,
 * de sonrisa a "o" y a tristeza, sin saltos.
 */
const Mouth: React.FC<{ uid: string; smile: number; open: number; wide: number; shift: number }> = ({ uid, smile, open, wide, shift }) => {
  const cx = 300 + shift;
  const baseY = 406;
  const op = clamp(open, 0, 1.2);
  const w = 36 * wide * (1 - op * 0.08);
  const cornerY = baseY - smile * 9;
  // Línea superior: curvada por la sonrisa; al abrir se aplana un poco.
  const upperCtrl = baseY + smile * 44 * clamp(1 - op * 1.5, 0.15, 1) - op * 8;
  const lowerCtrl = upperCtrl + op * 92 + Math.max(0, smile) * op * 14;
  const L = { x: cx - w, y: cornerY };
  const R = { x: cx + w, y: cornerY };
  const shape = `M ${f(L.x)} ${f(L.y)} Q ${f(cx)} ${f(upperCtrl)} ${f(R.x)} ${f(R.y)} Q ${f(cx)} ${f(lowerCtrl)} ${f(L.x)} ${f(L.y)} Z`;
  const upperMid = 0.5 * cornerY + 0.5 * upperCtrl;
  const clip = `${uid}-mouth`;
  const dimple = clamp((smile - 0.35) * 1.6, 0, 1) * (1 - clamp(op * 3, 0, 1));
  return (
    <g>
      {/* surco nariz → boca */}
      <path d={`M 300 398 Q ${f(300 + shift * 0.3)} ${f((398 + upperMid) / 2)} ${f(cx)} ${f(upperMid)}`} stroke={C.outline} strokeWidth={6} strokeLinecap="round" fill="none" />
      {op > 0.01 && (
        <>
          <defs>
            <clipPath id={clip}>
              <path d={shape} />
            </clipPath>
          </defs>
          <path d={shape} fill={C.mouth} />
          <g clipPath={`url(#${clip})`}>
            <ellipse cx={cx} cy={lowerCtrl * 0.5 + upperCtrl * 0.5 + op * 14} rx={w * 0.6} ry={10 + op * 12} fill={C.tongue} />
          </g>
        </>
      )}
      <path d={shape} fill="none" stroke={C.outline} strokeWidth={op > 0.01 ? 6 : 7} strokeLinejoin="round" strokeLinecap="round" />
      {dimple > 0 && (
        <path
          d={`M ${f(L.x - 7)} ${f(L.y - 6)} Q ${f(L.x - 3)} ${f(L.y + 1)} ${f(L.x + 2)} ${f(L.y + 3)} M ${f(R.x + 7)} ${f(R.y - 6)} Q ${f(R.x + 3)} ${f(R.y + 1)} ${f(R.x - 2)} ${f(R.y + 3)}`}
          stroke={C.outline}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          opacity={dimple}
        />
      )}
    </g>
  );
};

// ── CABEZA COMPLETA ──────────────────────────────────────────────────

/**
 * Cabeza de Tito en sus coordenadas de dibujo originales (diseño v2).
 * La matriz del esqueleto la ubica, rota y deforma.
 */
export const HeadArt: React.FC<{ uid: string; c: TitoChannels; earLAngle: number; earRAngle: number }> = ({ uid, c, earLAngle, earRAngle }) => {
  const yaw = c.headYaw;
  const openL = c.eyeOpenL * (1 - c.blink);
  const openR = c.eyeOpenR * (1 - c.blink);
  // Parallax 2,5D: lo que está más "adelante" (nariz) se mueve más con el giro.
  const eyesX = yaw * 12;
  const muzzleX = yaw * 20;
  const noseX = yaw * 26;
  const browArch = 12 + Math.max(0, c.browLY + c.browRY) * 3;

  return (
    <g>
      {/* Orejas */}
      <g transform={`rotate(${f(earLAngle)} 200 205)`}>
        <path d="M 155 225 C 135 160 140 90 165 45 C 205 80 245 130 260 175 Z" fill={C.fur} stroke={C.outline} strokeWidth={OUTLINE} strokeLinejoin="round" />
        <path d="M 175 190 C 168 150 170 115 180 90 C 205 115 225 145 235 170 Z" fill={C.earInner} />
        <path d="M 165 45 C 160 60 158 72 160 85 L 180 75 Z" fill={C.paws} />
      </g>
      <g transform={`rotate(${f(earRAngle)} 400 205)`}>
        <path d="M 445 225 C 465 160 460 90 435 45 C 395 80 355 130 340 175 Z" fill={C.fur} stroke={C.outline} strokeWidth={OUTLINE} strokeLinejoin="round" />
        <path d="M 425 190 C 432 150 430 115 420 90 C 395 115 375 145 365 170 Z" fill={C.earInner} />
        <path d="M 435 45 C 440 60 442 72 440 85 L 420 75 Z" fill={C.paws} />
      </g>

      {/* Forma de la cabeza */}
      <path
        d="M 300 150 C 400 150 470 210 478 300 C 482 340 470 365 500 395
           C 460 400 450 410 440 430 C 400 465 350 470 300 470
           C 250 470 200 465 160 430 C 150 410 140 400 100 395
           C 130 365 118 340 122 300 C 130 210 200 150 300 150 Z"
        fill={`url(#${uid}-head)`}
        stroke={C.outline}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path d="M 280 152 C 285 175 300 185 318 180 C 310 172 308 162 312 150 Z" fill={C.furLight} />

      {/* Máscara crema */}
      <g transform={`translate(${f(yaw * 8)} 0)`}>
        <path
          d="M 135 345 C 170 330 222 322 252 342 C 268 354 278 366 282 380
             L 318 380 C 322 366 332 354 348 342 C 378 322 430 330 465 345
             C 450 395 410 455 300 462 C 190 455 150 395 135 345 Z"
          fill={C.cream}
        />
      </g>
      <path d={`M ${f(300 + yaw * 6)} 236 Q ${f(290 + muzzleX)} 300 ${f(298 + muzzleX)} 362`} stroke={C.furLight} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.75} />

      {/* Hocico */}
      <g transform={`translate(${f(muzzleX)} 0)`}>
        <path d="M 256 372 C 258 352 280 346 300 346 C 320 346 342 352 344 372 C 348 410 334 452 300 458 C 266 452 252 410 256 372 Z" fill={`url(#${uid}-snout)`} />
        <path d="M 262 436 Q 300 474 338 436" stroke={C.creamShade} strokeWidth={7} fill="none" strokeLinecap="round" />
        <g fill={C.creamShade}>
          <circle cx={272} cy={392} r={3.5} />
          <circle cx={266} cy={404} r={3.5} />
          <circle cx={328} cy={392} r={3.5} />
          <circle cx={334} cy={404} r={3.5} />
        </g>
      </g>

      {/* Ojos y cejas */}
      <g transform={`translate(${f(eyesX)} 0)`}>
        <Brow cx={232} y={216 - c.browLY * 20} tilt={c.browLTilt} side={-1} arch={browArch} />
        <Brow cx={368} y={216 - c.browRY * 20} tilt={c.browRTilt} side={1} arch={browArch} />
        <Eye skin={`url(#${uid}-head)`} id={`${uid}-l`} cx={232} cy={282} open={openL} lower={c.lowerLidL} lookX={c.lookX} lookY={c.lookY} pupil={c.pupil} side={-1} />
        <Eye skin={`url(#${uid}-head)`} id={`${uid}-r`} cx={368} cy={282} open={openR} lower={c.lowerLidR} lookX={c.lookX} lookY={c.lookY} pupil={c.pupil} side={1} />
      </g>

      {/* Cachetes */}
      <ellipse cx={180 + yaw * 10} cy={372 - c.smile * 4} rx={30} ry={18} fill={C.blush} opacity={c.blush} />
      <ellipse cx={420 + yaw * 10} cy={372 - c.smile * 4} rx={30} ry={18} fill={C.blush} opacity={c.blush} />

      {/* Nariz y boca */}
      <g transform={`translate(${f(noseX)} 0)`}>
        <path d="M 272 370 Q 300 356 328 370 Q 324 392 300 400 Q 276 392 272 370 Z" fill={C.nose} />
        <ellipse cx={290} cy={370} rx={9} ry={5} fill="#FFFFFF" opacity={0.7} />
      </g>
      <g transform={`translate(${f(muzzleX)} 0)`}>
        <Mouth uid={uid} smile={c.smile} open={c.mouthOpen} wide={c.mouthWide} shift={c.mouthShift} />
      </g>
    </g>
  );
};
