import { openPath } from "@tauri-apps/plugin-opener";
import { Effect } from "effect";

import { extract } from "#/shared/api";

import { OpenFailed } from "./open-failed.ts";

const CANNOT_OPEN = "Unity で開けませんでした";

const importToUnity = (assetId: number): Promise<number> =>
  Effect.runPromise(
    Effect.promise(() => extract([assetId])).pipe(
      Effect.flatMap(({ path, assets }) =>
        Effect.tryPromise(() => openPath(path)).pipe(
          Effect.tapError((cause) => Effect.logWarning("open failed", path, cause)),
          Effect.mapError(() => OpenFailed.make({ message: CANNOT_OPEN })),
          Effect.as(assets),
        ),
      ),
    ),
  );

export { importToUnity };
