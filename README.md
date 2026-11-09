# UNIVERSO TITO 🦊

Videos educativos animados para niños de **3 a 6 años**, protagonizados por **Tito**, un pequeño zorro naranja curioso y aventurero.
Producidos con [Remotion](https://www.remotion.dev) (React → video).

| Formato | Valor |
|---|---|
| Relación | Vertical 9:16 |
| Resolución | 1080 × 1920 |
| Frames por segundo | 30 |
| Idioma | Español latinoamericano |

## Requisitos

- Node.js 18+ (probado con Node 22)
- ffmpeg no es necesario: Remotion trae el suyo.

```bash
npm install
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Abre **Remotion Studio** (vista previa interactiva con línea de tiempo) en http://localhost:3000 |
| `npm run render:intro` | Renderiza el episodio 0 en `out/tito-presentacion.mp4` |
| `npm run render:still` | Exporta un fotograma (frame 250) en PNG |
| `npm run render:ficha` | Exporta la ficha de personaje de Tito en PNG |
| `npm run check` | TypeScript + ESLint |

Renderizar cualquier composición o un rango de frames:

```bash
npx remotion render TitoPresentacion out/prueba.mp4 --frames=0-120
npx remotion still TitoPresentacion out/frame.png --frame=240
```

## Estructura

```
src/
├── index.ts / Root.tsx         Registro de composiciones (episodios + ficha)
├── config/video.ts             Formato oficial (1080×1920, 30 fps), sec(), zonas seguras
├── theme/                      Paleta de colores y tipografía (Fredoka, local)
├── lib/motion.ts               Helpers de animación (lerp, bouncy, wave, arc)
├── characters/
│   ├── tito/design.ts          ⭐ FICHA OFICIAL de Tito (colores y proporciones)
│   ├── tito/Tito.tsx           Tito en SVG con partes animables (ojos, boca, orejas, brazos, cola, bufanda)
│   ├── tito/idle.ts            Animación de reposo: respiración, parpadeo, cola, orejas
│   └── CharacterOnStage.tsx    Posiciona personajes por los pies
├── backgrounds/forest/         Bosque con parallax: cielo, sol, nubes, montañas, árboles,
│                               pradera, flores, rayos de luz; primer plano con arbustos,
│                               hojas, mariposas, polen y viñeta. Cámara virtual (x, y, zoom).
├── components/                 Subtítulos animados, logo, destellos, cierre de iris
├── audio/                      Voces, música y efectos (ver abajo)
├── episodes/
│   ├── types.ts                Definición de episodio y escena
│   ├── Episode.tsx             Reproduce escenas con transiciones + música del episodio
│   ├── registry.ts             Lista de episodios publicados
│   ├── ep00-presentacion/      Episodio 0: "¡Hola, soy Tito!" (guion + escena)
│   └── _plantilla/             Plantilla para crear episodios nuevos
└── compositions/FichaTito.tsx  Model sheet del personaje
public/
├── fonts/                      Fredoka (licencia OFL)
└── audio/{voces,musica,sfx}/   Archivos de audio
```

## Audio: voces, música y efectos

El sistema está listo para recibir audio **sin tocar código**:

1. **Voces**: cada línea del guion (`src/episodes/ep00-presentacion/script.ts`) tiene un campo `voice`,
   por ejemplo `audio/voces/ep00/01-hola.mp3`. Guardá el archivo en `public/` con ese nombre y se reproduce
   automáticamente en el momento de la línea.
2. **Música**: `audio/musica/tema-universo-tito.mp3` (ver `src/audio/sfx-library.ts`). Tiene fade in/out y
   baja sola de volumen mientras habla un personaje (*ducking*).
3. **Efectos**: `public/audio/sfx/` → `pop.mp3`, `boing.mp3`, `whoosh.mp3`, `arbusto.mp3`, `brillo.mp3`,
   `pajaritos.mp3`, `aterrizaje.mp3`. Ya están sincronizados con la animación del episodio 0.

Los archivos que todavía no existen se ignoran: el video se puede renderizar en cualquier momento.
Después de agregar audios, reiniciá Studio o volvé a renderizar.

## Crear un episodio nuevo

1. Copiá `src/episodes/_plantilla` a `src/episodes/ep01-tema`.
2. Escribí el guion (`buildDialogue`) y las escenas; cada escena empieza en su frame 0.
3. Definí `compositionId`, título, objetivo pedagógico y escenas (con transiciones `fade`, `slide`, `wipe`, `clockWipe`).
4. Agregalo a `src/episodes/registry.ts`. Aparece solo en Studio.

## Sistema de animación v3 (rig deformable) — en laboratorio

Nuevo sistema construido en paralelo (el episodio 0 todavía usa el Tito anterior):

```
src/rig/                     Motor genérico
├── math.ts, matrix.ts       Matemática 2D, ruido orgánico
├── curves.ts                Curvas suaves, tubos, contornos con mechones
├── ik.ts                    Cinemática inversa de dos huesos (piernas)
├── physics.ts               Cadenas con resortes angulares (cola, bufanda), deterministas y en caché
├── spring.ts                Resorte amortiguado (orejas)
└── tracks.ts                Poses clave con interpolación cúbica monótona
src/characters/tito-rig/     Tito v3
├── channels.ts              Todos los canales animables y la pose de reposo
├── skeleton.ts              Esqueleto: columna curva, brazos, piernas (IK), cabeza
├── body.tsx / head.tsx      Dibujo deformable (torso, tubos, cola, bufanda, cara con párpados)
├── face.ts                  Expresiones graduales, parpadeo, microsacadas, habla por sílabas
├── secondary.ts             Física secundaria de cola, orejas y bufanda
├── performance.ts           Capas: poses clave + reposo vivo + salto + saludo + habla + mirada
└── TitoRig.tsx              Componente final (opción showBones para ver el esqueleto)
src/lab/                     Demo y hojas de prueba (carpeta "Laboratorio" en Studio)
```

| Comando | Qué hace |
|---|---|
| `npm run render:demo` | Demo de 10 s → `out/tito-demo-animacion.mp4` |
| `npm run render:demo-huesos` | La misma demo mostrando el esqueleto encima |
| `npm run test:animacion` | Detector automático de tirones en la animación |

## Reglas de consistencia de Tito

- Referencia oficial de las tres vistas (frente, tres cuartos, perfil): `docs/referencias/tito-giro-oficial.png`
  y sus reglas en `docs/referencias/README.md`.

- Nunca cambiar `src/characters/tito/design.ts` dentro de un episodio.
- Las expresiones disponibles son `feliz`, `sorpresa`, `curioso`, `guino`; nuevas expresiones o accesorios se agregan como props de `<Tito/>`.
- Revisar la ficha (`npm run render:ficha`) antes de aprobar cambios en el personaje.
