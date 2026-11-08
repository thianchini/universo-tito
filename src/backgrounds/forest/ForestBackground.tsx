import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { VIDEO } from "../../config/video";
import { wave } from "../../lib/motion";
import { PALETTE } from "../../theme/palette";
import { Bush, Butterfly, Cloud, Flower, GrassTuft, Leaf, PineTree, RoundTree } from "./elements";

/**
 * Cámara virtual compartida por fondo y primer plano.
 * x: paneo horizontal (px), y: positivo = mira hacia arriba (cielo), zoom: 1 = normal.
 */
export type Camera = { x: number; y: number; zoom: number };
export const DEFAULT_CAMERA: Camera = { x: 0, y: 0, zoom: 1 };

const W = VIDEO.width;
const H = VIDEO.height;
/** Línea del horizonte y del piso donde se paran los personajes. */
export const HORIZON_Y = 1180;
export const GROUND_Y = 1600;

/**
 * Capa con profundidad: `depth` 0 = infinito (no se mueve), 1 = plano del
 * personaje, >1 = primer plano (se mueve más rápido que el personaje).
 */
export const WorldLayer: React.FC<{ depth: number; camera: Camera; children: React.ReactNode }> = ({
  depth,
  camera,
  children,
}) => {
  const zoom = 1 + (camera.zoom - 1) * depth;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${-camera.x * depth}px, ${camera.y * depth}px) scale(${zoom})`,
        transformOrigin: `${W / 2}px ${GROUND_Y}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Convierte un punto del mundo (en una capa de profundidad `depth`) a coordenadas de pantalla. */
export const worldToScreen = (
  p: { x: number; y: number },
  depth: number,
  camera: Camera,
): { x: number; y: number } => {
  const zoom = 1 + (camera.zoom - 1) * depth;
  const ox = W / 2;
  const oy = GROUND_Y;
  return {
    x: ox + (p.x - ox) * zoom - camera.x * depth,
    y: oy + (p.y - oy) * zoom + camera.y * depth,
  };
};

/** Plano de personajes: misma profundidad que la pradera. */
export const CHARACTER_DEPTH = 0.85;

const Layer: React.FC<{ depth: number; camera: Camera; children: React.ReactNode }> = ({
  depth,
  camera,
  children,
}) => (
  <WorldLayer depth={depth} camera={camera}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {children}
    </svg>
  </WorldLayer>
);

/** Fondo de bosque: todo lo que está DETRÁS de los personajes. */
export const ForestBackground: React.FC<{ camera?: Camera }> = ({ camera = DEFAULT_CAMERA }) => {
  const frame = useCurrentFrame();

  const clouds = useMemo(
    () =>
      new Array(7).fill(0).map((_, i) => ({
        x: random(`cloud-x-${i}`) * 1800 - 400,
        y: -900 + random(`cloud-y-${i}`) * 1650,
        scale: 0.6 + random(`cloud-s-${i}`) * 0.8,
        speed: 0.3 + random(`cloud-v-${i}`) * 0.5,
      })),
    [],
  );

  const flowers = useMemo(
    () =>
      new Array(26).fill(0).map((_, i) => ({
        x: -200 + random(`fl-x-${i}`) * 1480,
        y: 1330 + random(`fl-y-${i}`) * 520,
        color: PALETTE.flowers[Math.floor(random(`fl-c-${i}`) * PALETTE.flowers.length)],
        phase: random(`fl-p-${i}`) * Math.PI * 2,
      })),
    [],
  );

  const sunRays = new Array(12).fill(0).map((_, i) => i * 30);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.sky.top }}>
      {/* 1. CIELO (se extiende hacia arriba para los planos de cámara alta) */}
      <Layer depth={0.05} camera={camera}>
        <defs>
          <linearGradient id="forest-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E7FD8" />
            <stop offset="45%" stopColor={PALETTE.sky.top} />
            <stop offset="78%" stopColor={PALETTE.sky.mid} />
            <stop offset="100%" stopColor={PALETTE.sky.horizon} />
          </linearGradient>
        </defs>
        <rect x={-600} y={-2200} width={W + 1200} height={H + 2200} fill="url(#forest-sky)" />
      </Layer>

      {/* 2. SOL con rayos girando */}
      <Layer depth={0.1} camera={camera}>
        <defs>
          <radialGradient id="forest-sun-glow">
            <stop offset="0%" stopColor={PALETTE.sun.glow} stopOpacity={0.75} />
            <stop offset="100%" stopColor={PALETTE.sun.glow} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={790} cy={560} r={420 + wave(frame, 90, 18)} fill="url(#forest-sun-glow)" />
        <g transform={`translate(790 560) rotate(${frame * 0.25})`} opacity={0.35}>
          {sunRays.map((a) => (
            <path key={a} d="M -22 -150 L 22 -150 L 0 -330 Z" fill="#FFF3B0" transform={`rotate(${a})`} />
          ))}
        </g>
        <circle cx={790} cy={560} r={120} fill={PALETTE.sun.core} />
        <circle cx={790} cy={560} r={102} fill="#FFF0A0" />
      </Layer>

      {/* 3. NUBES a la deriva */}
      <Layer depth={0.18} camera={camera}>
        {clouds.map((c, i) => {
          const range = 2000;
          const x = ((c.x + frame * c.speed + 500) % range) - 500;
          return <Cloud key={i} x={x} y={c.y + wave(frame, 150 + i * 20, 6)} scale={c.scale} />;
        })}
      </Layer>

      {/* 4. MONTAÑAS lejanas */}
      <Layer depth={0.28} camera={camera}>
        <path
          d={`M -400 ${HORIZON_Y} L -400 980 Q -150 760 100 930 Q 300 700 560 900 Q 800 720 1050 910 Q 1250 780 1500 960 L 1500 ${HORIZON_Y} Z`}
          fill={PALETTE.mountains[1]}
        />
        <path d="M 300 760 Q 330 735 360 765 Q 330 780 300 760 Z" fill="#FFFFFF" opacity={0.8} />
        <path
          d={`M -400 ${HORIZON_Y} L -400 1050 Q -100 900 200 1030 Q 450 880 720 1020 Q 980 900 1500 1040 L 1500 ${HORIZON_Y} Z`}
          fill={PALETTE.mountains[0]}
        />
      </Layer>

      {/* 5. LÍNEA DE BOSQUE LEJANA */}
      <Layer depth={0.42} camera={camera}>
        {new Array(22).fill(0).map((_, i) => {
          const x = -400 + i * 90;
          const r = 70 + random(`far-${i}`) * 50;
          return (
            <circle key={i} cx={x} cy={HORIZON_Y - 20 - random(`far-y-${i}`) * 40} r={r} fill={PALETTE.forestFar[i % 2]} />
          );
        })}
        <rect x={-500} y={HORIZON_Y - 30} width={W + 1000} height={200} fill={PALETTE.forestFar[0]} />
      </Layer>

      {/* 6. ÁRBOLES MEDIOS (se mecen con el viento) */}
      <Layer depth={0.62} camera={camera}>
        <PineTree x={-60} y={1290} scale={1.25} colors={["#2B8C52", "#35A05E", "#43B36B"]} sway={wave(frame, 110, 1.5)} />
        <RoundTree x={170} y={1270} scale={0.95} colors={PALETTE.forestMid} sway={wave(frame, 95, 2, 1)} />
        <PineTree x={420} y={1240} scale={0.8} colors={["#3A9E63", "#46B070", "#55C27B"]} sway={wave(frame, 120, 1.5, 2)} />
        <RoundTree x={690} y={1250} scale={0.8} colors={["#3DAA62", "#4FC071", "#6AD585"]} sway={wave(frame, 100, 2, 3)} />
        <PineTree x={930} y={1280} scale={1.15} colors={["#2B8C52", "#35A05E", "#43B36B"]} sway={wave(frame, 105, 1.5, 4)} />
        <RoundTree x={1180} y={1300} scale={1.05} colors={PALETTE.forestMid} sway={wave(frame, 90, 2, 5)} />
      </Layer>

      {/* 7. RAYOS DE LUZ cinematográficos */}
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.35 + wave(frame, 120, 0.1) }}>
        <svg width={W} height={H}>
          <defs>
            <linearGradient id="forest-ray" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF4C2" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#FFF4C2" stopOpacity={0} />
            </linearGradient>
          </defs>
          {[
            [700, 140, 0],
            [880, 90, 1],
            [560, 70, 2],
          ].map(([x, w, i]) => (
            <path
              key={i}
              d={`M ${x} -100 L ${x + w} -100 L ${x - 380 + w * 2} ${H} L ${x - 520} ${H} Z`}
              fill="url(#forest-ray)"
              opacity={0.5 + wave(frame, 70 + i * 25, 0.25, i)}
              transform={`translate(${camera.y * 0.3 - camera.x * 0.3} ${camera.y * 0.5})`}
            />
          ))}
        </svg>
      </AbsoluteFill>

      {/* 8. PRADERA, sendero, flores y pasto (plano de los personajes) */}
      <Layer depth={0.85} camera={camera}>
        <defs>
          <linearGradient id="forest-meadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.meadow[0]} />
            <stop offset="60%" stopColor={PALETTE.meadow[1]} />
            <stop offset="100%" stopColor={PALETTE.meadow[2]} />
          </linearGradient>
        </defs>
        <path
          d={`M -500 1330 Q 100 1230 540 1290 Q 980 1350 1580 1260 L 1580 ${H + 400} L -500 ${H + 400} Z`}
          fill="url(#forest-meadow)"
        />
        {/* Sendero que se pierde en el horizonte */}
        <path
          d={`M 470 1300 Q 520 1290 580 1300 Q 640 1420 760 1560 Q 860 1700 900 ${H + 400} L 180 ${H + 400} Q 320 1700 420 1520 Q 480 1400 470 1300 Z`}
          fill={PALETTE.path}
          opacity={0.9}
        />
        {flowers.map((f, i) => (
          <Flower key={i} x={f.x} y={f.y} scale={0.55 + (f.y - 1330) / 900} color={f.color} sway={wave(frame, 60, 6, f.phase)} />
        ))}
        {new Array(16).fill(0).map((_, i) => (
          <GrassTuft
            key={i}
            x={-200 + random(`g-x-${i}`) * 1480}
            y={1350 + random(`g-y-${i}`) * 500}
            scale={0.7 + random(`g-s-${i}`) * 0.6}
            color={i % 2 ? "#3E9B3A" : "#4FB244"}
            sway={wave(frame, 50, 6, i)}
          />
        ))}
      </Layer>
    </AbsoluteFill>
  );
};

/**
 * Primer plano: todo lo que está DELANTE de los personajes
 * (arbustos, hojas que caen, mariposas, polen, viñeta).
 */
export const ForestForeground: React.FC<{
  camera?: Camera;
  /** Movimiento del arbusto derecho (ej. cuando Tito sale de atrás). */
  bushRustle?: number;
  showButterflies?: boolean;
}> = ({ camera = DEFAULT_CAMERA, bushRustle = 0, showButterflies = true }) => {
  const frame = useCurrentFrame();

  const leaves = useMemo(
    () =>
      new Array(9).fill(0).map((_, i) => ({
        x: random(`leaf-x-${i}`) * W,
        start: random(`leaf-t-${i}`) * 400,
        speed: 2 + random(`leaf-v-${i}`) * 2,
        color: ["#FFB938", "#FF8A3D", "#9BD84A", "#FFD23F"][i % 4],
        scale: 0.6 + random(`leaf-s-${i}`) * 0.6,
      })),
    [],
  );

  const pollen = useMemo(
    () =>
      new Array(30).fill(0).map((_, i) => ({
        x: random(`p-x-${i}`) * W,
        y: random(`p-y-${i}`) * H,
        r: 3 + random(`p-r-${i}`) * 6,
        phase: random(`p-ph-${i}`) * Math.PI * 2,
      })),
    [],
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Arbustos grandes */}
      <Layer depth={1.1} camera={camera}>
        <Bush x={60} y={1960} scale={1.1} rustle={wave(frame, 80, 1)} />
        <Bush x={960} y={1880} scale={1.0} rustle={bushRustle + wave(frame, 85, 1, 2)} flip />
      </Layer>

      {/* Mariposas */}
      {showButterflies && (
        <Layer depth={0.95} camera={camera}>
          <Butterfly
            x={540 + wave(frame, 210, 380) + wave(frame, 70, 40)}
            y={950 + wave(frame, 140, 160, 1)}
            flap={(wave(frame, 6) + 1) / 2}
            color="#FF8AD8"
            rotate={wave(frame, 70, 15)}
          />
          <Butterfly
            x={540 + wave(frame, 260, -300, 2)}
            y={1180 + wave(frame, 120, 120)}
            flap={(wave(frame, 5, 1, 1) + 1) / 2}
            color="#7FD3FF"
            scale={0.8}
            rotate={wave(frame, 60, -15)}
          />
        </Layer>
      )}

      {/* Hojas cayendo */}
      <Layer depth={1.05} camera={camera}>
        {leaves.map((l, i) => {
          const t = (frame + l.start) % 420;
          const y = -100 + t * l.speed * 1.6;
          return (
            <Leaf
              key={i}
              x={l.x + wave(t, 90, 60, i)}
              y={y}
              rotate={t * 3 + i * 40}
              scale={l.scale}
              color={l.color}
            />
          );
        })}
      </Layer>

      {/* Polen / luciérnagas brillantes */}
      <AbsoluteFill style={{ mixBlendMode: "screen" }}>
        <svg width={W} height={H}>
          {pollen.map((p, i) => {
            const y = (((p.y - frame * 1.2) % H) + H) % H;
            return (
              <circle
                key={i}
                cx={p.x + wave(frame, 80, 25, p.phase)}
                cy={y}
                r={p.r}
                fill="#FFF6B0"
                opacity={0.35 + wave(frame, 40, 0.3, p.phase)}
              />
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* Viñeta cinematográfica suave */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,40,20,0.35) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
