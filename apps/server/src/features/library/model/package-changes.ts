import { Array, Duration, Effect, FileSystem, Stream, pipe } from "effect";

import { isPackage } from "./scan-folders.ts";

const watchFolder =
  (fileSystem: FileSystem.FileSystem) =>
  (path: string): Stream.Stream<string> =>
    fileSystem.watch(path, { recursive: true }).pipe(
      Stream.map((event) => event.path),
      Stream.catchCause((cause) =>
        Stream.fromEffect(Effect.logWarning("watch failed", path, cause)).pipe(Stream.drain),
      ),
    );

/** @internal */
const packageChanges = Effect.fn("packageChanges")(function* watchPackages(
  paths: readonly string[],
  settleMillis: number,
) {
  const fileSystem = yield* FileSystem.FileSystem;
  return pipe(
    paths,
    Array.map(watchFolder(fileSystem)),
    Stream.mergeAll({ concurrency: "unbounded" }),
    Stream.filter(isPackage),
    Stream.debounce(Duration.millis(settleMillis)),
  );
});

export { packageChanges };
