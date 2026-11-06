import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";

import { listed, withSettings, writeTree } from "./intake-fixture.ts";
import { intake } from "./intake.ts";

const BOTH = 2;

layer(NodeServices.layer, { excludeTestServices: true })("intake of loose files", (it) => {
  it.effect("copies loose models with their materials and keeps the folder layout", () =>
    Effect.gen(function* copiesLoose() {
      const fileSystem = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const downloads = yield* fileSystem.makeTempDirectoryScoped();
      yield* writeTree(downloads, {
        "crate.obj": "mtllib crate.mtl",
        "crate.mtl": "map_Kd wood.png",
        "notes.txt": "ignored",
        "Kit/Models/sword.fbx": "fbx",
        "Kit/cover.png": "png",
      });
      const crate = path.join(downloads, "crate.obj");
      const kit = path.join(downloads, "Kit");
      yield* withSettings((library) =>
        Effect.gen(function* inLibrary() {
          const placed = yield* intake([crate, kit]);
          expect(placed).toBe(BOTH);
          const names = yield* listed(library);
          expect(names).toStrictEqual([
            "Kit",
            path.join("Kit", "Models"),
            path.join("Kit", "Models", "sword.fbx"),
            path.join("Kit", "cover.png"),
            "crate",
            path.join("crate", "crate.mtl"),
            path.join("crate", "crate.obj"),
          ]);
        }),
      );
    }),
  );
});
