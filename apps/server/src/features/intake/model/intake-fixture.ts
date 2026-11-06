import { Array, Effect, FileSystem, Option, Order, Path, Record, pipe } from "effect";

import { Settings } from "#shared/settings";

import { libraryFolder } from "./library-folder.ts";

/** @internal */
const withSettings = Effect.fn("withSettings")(function* withSettings<Value, Failure, Requirements>(
  run: (folder: string) => Effect.Effect<Value, Failure, Requirements>,
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const dataDirectory = yield* fileSystem.makeTempDirectoryScoped();
  const settings = {
    dataDirectory,
    modelDirectory: Option.none<string>(),
    embedderWorker: new URL("file:///unused"),
  };
  const library = yield* libraryFolder.pipe(Effect.provideService(Settings, settings));
  return yield* run(library).pipe(Effect.provideService(Settings, settings));
});

/** @internal */
const listed = Effect.fn("listed")(function* listed(folder: string) {
  const fileSystem = yield* FileSystem.FileSystem;
  const names = yield* fileSystem.readDirectory(folder, { recursive: true });
  return pipe(
    names,
    Array.sortWith((name: string) => name, Order.String),
  );
});

/** @internal */
const writeTree = Effect.fn("writeTree")(function* writeTree(
  root: string,
  files: Readonly<Record<string, string>>,
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* pipe(
    Record.toEntries(files),
    Effect.forEach(([name, text]) => {
      const file = path.join(root, name);
      return fileSystem
        .makeDirectory(path.dirname(file), { recursive: true })
        .pipe(Effect.andThen(fileSystem.writeFileString(file, text)));
    }),
  );
});

export { listed, withSettings, writeTree };
