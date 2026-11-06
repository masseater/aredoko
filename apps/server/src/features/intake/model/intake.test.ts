import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import { TextReader, Uint8ArrayWriter, ZipWriter } from "@zip.js/zip.js";
import { Effect, FileSystem, Path } from "effect";

import { listed, withSettings } from "./intake-fixture.ts";
import { intake } from "./intake.ts";

const ZIPPED = "衣装/Dress.unitypackage";
const BOTH = 2;
const THREE = 3;
const NONE = 0;

const makeZip = Effect.gen(function* makeZip() {
  const writer = new ZipWriter(new Uint8ArrayWriter());
  yield* Effect.promise(() => writer.add(ZIPPED, new TextReader("dress")));
  yield* Effect.promise(() => writer.add("readme.txt", new TextReader("ignored")));
  yield* Effect.promise(() => writer.add("Textures/dress.png", new TextReader("png")));
  return yield* Effect.promise(() => writer.close());
});

layer(NodeServices.layer, { excludeTestServices: true })("intake", (it) => {
  it.effect("copies dropped packages and the packages inside a zip into the library", () =>
    Effect.gen(function* copiesDropped() {
      const fileSystem = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const downloads = yield* fileSystem.makeTempDirectoryScoped();
      const cabin = path.join(downloads, "Cabin.unitypackage");
      const zip = path.join(downloads, "Dress.zip");
      yield* fileSystem.writeFileString(cabin, "cabin");
      const zipBytes = yield* makeZip;
      yield* fileSystem.writeFile(zip, zipBytes);
      yield* withSettings((library) =>
        Effect.gen(function* inLibrary() {
          const placed = yield* intake([cabin, zip]);
          expect(placed).toBe(THREE);
          const names = yield* listed(library);
          expect(names).toStrictEqual([
            "Cabin.unitypackage",
            "Dress",
            path.join("Dress", "Dress.unitypackage"),
            path.join("Dress", "Textures"),
            path.join("Dress", "Textures", "dress.png"),
          ]);
          const again = yield* intake([downloads]);
          expect(again).toBe(NONE);
        }),
      );
    }),
  );

  it.effect("keeps both when a different package has the same name", () =>
    Effect.gen(function* keepsBoth() {
      const fileSystem = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const first = yield* fileSystem.makeTempDirectoryScoped();
      const second = yield* fileSystem.makeTempDirectoryScoped();
      yield* fileSystem.writeFileString(path.join(first, "Cabin.unitypackage"), "v1");
      yield* fileSystem.writeFileString(path.join(second, "Cabin.unitypackage"), "version 2");
      yield* withSettings((library) =>
        Effect.gen(function* inLibrary() {
          const placed = yield* intake([first, second]);
          expect(placed).toBe(BOTH);
          const names = yield* listed(library);
          expect(names).toStrictEqual(["Cabin (2).unitypackage", "Cabin.unitypackage"]);
        }),
      );
    }),
  );
});
