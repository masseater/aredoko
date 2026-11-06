import { Config, Effect, FileSystem, Option, Path, pipe } from "effect";

const CUSTOM_LOCATION = "ASSETSTORE_CACHE_PATH";
const ROAMING = "APPDATA";
const DEFAULT_FOLDER = ["Unity", "Asset Store-5.x"] as const;

const location = Effect.gen(function* location() {
  const path = yield* Path.Path;
  const custom = yield* Config.option(Config.String(CUSTOM_LOCATION));
  if (Option.isSome(custom)) {
    return custom;
  }
  const roaming = yield* Config.option(Config.String(ROAMING));
  return pipe(
    roaming,
    Option.map((directory) => path.join(directory, ...DEFAULT_FOLDER)),
  );
});

/** @internal */
const findAssetStore = Effect.fn("findAssetStore")(function* findAssetStoreFolder() {
  const fileSystem = yield* FileSystem.FileSystem;
  const found = yield* location;
  if (Option.isNone(found)) {
    return found;
  }
  const exists = yield* fileSystem.exists(found.value).pipe(Effect.orElseSucceed(() => false));
  return pipe(
    found,
    Option.filter(() => exists),
  );
});

export { findAssetStore };
