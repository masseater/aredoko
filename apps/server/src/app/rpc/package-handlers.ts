import { Array, Effect, Option, Path, pipe } from "effect";
import { RequestFailed } from "protocol";
import type { ProjectAsset } from "protocol";

import { packagesWhere } from "#entities/package";
import { fetchItem } from "#features/booth";
import { extract } from "#features/extract";
import { Library, linkBooth, pruneProject, putProjectAssets } from "#features/library";
import { Settings } from "#shared/settings";

import { failed, firstOr } from "./request-failed.ts";

const EXTRACTED_DIRECTORY = "extracted";
const NO_PACKAGE = "パッケージが見つかりません";
const INVALID_BOOTH_URL = "BOOTH の商品ページの URL を入力してください";

/** @internal */
const packageById = Effect.fn("packageById")(function* selectPackage(id: number) {
  return yield* firstOr(NO_PACKAGE)(Option.some(id).pipe(packagesWhere));
});

/** @internal */
const extractAssets = Effect.fn("Extract")(function* extractRequest({
  assetIds,
}: {
  readonly assetIds: readonly number[];
}) {
  const { dataDirectory } = yield* Settings;
  const path = yield* Path.Path;
  return yield* failed(extract(assetIds, path.join(dataDirectory, EXTRACTED_DIRECTORY)));
});

/** @internal */
const linkBoothItem = Effect.fn("LinkBooth")(function* linkRequest({
  packageId,
  url,
}: {
  readonly packageId: number;
  readonly url: string;
}) {
  const item = yield* fetchItem(url).pipe(
    Effect.catchTag("InvalidBoothUrl", () =>
      Effect.fail(RequestFailed.make({ reason: "Invalid", message: INVALID_BOOTH_URL })),
    ),
    failed,
  );
  yield* failed(linkBooth({ packageId, item }));
  return yield* packageById(packageId);
});

/** @internal */
const putAssets = Effect.fn("PutProjectAssets")(function* putRequest({
  projectPath,
  assets,
  complete,
}: {
  readonly projectPath: string;
  readonly assets: readonly (typeof ProjectAsset.Type)[];
  readonly complete: boolean;
}) {
  const library = yield* Library;
  const packageId = yield* failed(putProjectAssets({ projectPath, assets }));
  const guids = pipe(
    assets,
    Array.map(({ guid }) => guid),
  );
  const seen = yield* library.remember({ projectPath, guids });
  if (complete) {
    yield* failed(pruneProject({ packageId, projectPath, seen }));
    yield* library.forget(projectPath);
    yield* library.requestScan;
  }
});

export { extractAssets, linkBoothItem, packageById, putAssets };
