/** Paleta global del universo (fondos, UI y textos). */
export const PALETTE = {
  sky: {
    top: "#3FA9F5",
    mid: "#8FD8FF",
    horizon: "#FFE7B3",
  },
  sun: { core: "#FFF6C9", glow: "#FFD45C" },
  cloud: "#FFFFFF",
  mountains: ["#9C8CE0", "#B9A6EE"],
  forestFar: ["#4FAF9B", "#5FC2A6"],
  forestMid: ["#2E9E5B", "#3DB86A", "#56C96F"],
  forestNear: ["#1F7A45", "#278F50"],
  trunk: ["#7A4A2A", "#5E3820"],
  meadow: ["#7DD35A", "#5DBE4A", "#48A63E"],
  path: "#F2D49B",
  flowers: ["#FF6B9A", "#FFD23F", "#FFFFFF", "#B48CFF", "#FF8A3D"],
  ui: {
    ink: "#2B1A10",
    bubble: "#FFFFFF",
    accent: "#FF8A3D",
  },
  logo: ["#FF6B6B", "#FFB938", "#FFE14D", "#6BD66B", "#4DB8FF", "#A98BFF"],
} as const;
