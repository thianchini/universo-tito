// Configuración global de Remotion CLI (studio, render, still).
// Documentación: https://www.remotion.dev/docs/config
import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setConcurrency(2);

// En este entorno cloud ya hay un Chrome Headless Shell instalado: lo usamos para
// no depender de la descarga automática. En otra máquina, Remotion descarga el suyo.
const LOCAL_HEADLESS_SHELL =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (existsSync(LOCAL_HEADLESS_SHELL)) {
  Config.setBrowserExecutable(LOCAL_HEADLESS_SHELL);
}
