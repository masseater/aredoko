import { open } from "@tauri-apps/plugin-dialog";
import { Array, Effect, Option, Record, pipe } from "effect";
import { ARCHIVE_EXTENSIONS, LOOSE_EXTENSIONS } from "protocol";

const FILTER = {
  name: "アセット",
  extensions: [...ARCHIVE_EXTENSIONS, ...pipe(Record.values(LOOSE_EXTENSIONS), Array.flatten)],
};

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
