import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

const DEV_PORT = 1420;

export default defineConfig({
  run: {
    tasks: {
      "dev:app": {
        command:
          "set WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222&& set OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318&& set OTEL_TRACES_EXPORTER=otlp&& tauri dev",
        cache: false,
      },
    },
  },
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), viteReact()],
  clearScreen: false,
  envPrefix: ["VITE_", "OTEL_"],
  server: {
    port: DEV_PORT,
    strictPort: true,
    watch: { ignored: ["**/src-tauri/**"] },
  },
});
