import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: { main: "src/app/main.ts", "embedder-worker": "src/app/embedder-worker.ts" },
    outDir: "dist",
    platform: "node",
    format: "esm",
    deps: {
      alwaysBundle: [/./u],
      onlyBundle: false,
      neverBundle: ["@huggingface/transformers", "sqlite-vec"],
    },
  },
  run: {
    tasks: {
      "fetch-model": "node src/app/fetch-model.ts",
      serve: {
        command: "node src/app/main.ts",
        cache: false,
      },
    },
  },
});
