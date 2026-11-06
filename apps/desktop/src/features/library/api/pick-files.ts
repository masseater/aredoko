import { open } from "@tauri-apps/plugin-dialog";
import { Effect, Option, pipe } from "effect";

const FILTER = { name: "Unity パッケージ", extensions: ["unitypackage", "zip"] };

const pickFiles = (): Promise<readonly string[]> =>
  Effect.runPromise(
    Effect.promise(() => open({ multiple: true, directory: false, filters: [FILTER] })).pipe(
      Effect.map((picked) =>
        pipe(
          Option.fromNullOr(picked),
          Option.getOrElse((): readonly string[] => []),
        ),
      ),
    ),
  );

export { pickFiles };
