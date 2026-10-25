import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

const DEV_PORT = 1420;

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), viteReact()],
  clearScreen: false,
  server: {
    port: DEV_PORT,
    strictPort: true,
    watch: { ignored: ["**/src-tauri/**"] },
  },
});
