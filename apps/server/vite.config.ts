import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      serve: {
        command: "node src/app/main.ts",
        cache: false,
      },
    },
  },
});
