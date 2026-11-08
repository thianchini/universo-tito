import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/** Tipografía oficial: Fredoka (redondeada, legible para primeros lectores). */
export const FONT_FAMILY = "Fredoka";

// loadFont() bloquea el render hasta que la fuente esté cargada (delayRender interno),
// así nunca aparece un frame con la tipografía equivocada.
loadFont({
  family: FONT_FAMILY,
  url: staticFile("fonts/fredoka-latin-600-normal.woff2"),
  weight: "600",
});
loadFont({
  family: FONT_FAMILY,
  url: staticFile("fonts/fredoka-latin-700-normal.woff2"),
  weight: "700",
});
