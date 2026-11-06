import { Array, Effect, FileSystem, Path, pipe } from "effect";

import { isPackage, isZip } from "./is-package.ts";
import { libraryFolder } from "./library-folder.ts";
import { placeFile } from "./place-file.ts";
import { unzipPackages } from "./unzip-packages.ts";

const NONE = 0;

const isIntakeFile = (name: string): boolean => isPackage(name) || isZip(name);

const filesIn = Effect.fn("filesIn")(function* listIntakeFiles(dropped: string) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const info = yield* fileSystem.stat(dropped);
  if (info.type !== "Directory") {
    return Array.of(dropped);
  }
  const names = yield* fileSystem.readDirectory(dropped, { recursive: true });
  return pipe(
    names,
    Array.filter(isIntakeFile),
    Array.map((name) => path.join(dropped, name)),
  );
});

const copyPackage = Effect.fn("copyPackage")(function* copyPackageInto(
  file: string,
  library: string,
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const { size } = yield* fileSystem.stat(file);
  const placed = yield* placeFile({
    folder: library,
    name: path.basename(file),
    size: Number(size),
    write: (partial) => fileSystem.copyFile(file, partial),
  });
  return Number(placed);
});

const takeIn = Effect.fn("takeIn")(function* takeIn(file: string, library: string) {
  if (isZip(file)) {
    return yield* unzipPackages(file, library);
  }
  return yield* copyPackage(file, library);
});

/** @internal */
const intake = Effect.fn("intake")(function* intakeFiles(dropped: readonly string[]) {
  const library = yield* libraryFolder;
  const files = yield* pipe(dropped, Effect.forEach(filesIn));
  const placed = yield* pipe(
    Array.flatten(files),
    Array.filter(isIntakeFile),
    Effect.forEach((file) => takeIn(file, library)),
  );
  return Array.reduce(placed, NONE, (total, count) => total + count);
});

export { intake };
