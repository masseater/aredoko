import { Effect, Option } from "effect";
import { AredokoRpcs, RequestFailed } from "protocol";

import { packagesWhere } from "#entities/package";
import { addSource, listSources, preview, progress, removeSource } from "#features/catalog";
import { ensureLibraryFolder, findAssetStore, intake } from "#features/intake";
import { Library } from "#features/library";
import { browse, search } from "#features/search";
import { Embedder } from "#shared/embedding";

import { extractAssets, linkBoothItem, packageById, putAssets } from "./package-handlers.ts";
import { failed } from "./request-failed.ts";

const VERSION = "0.1.0";
const NO_PREVIEW = "プレビューがありません";

const getStatus = Effect.fn("GetStatus")(function* status() {
  const library = yield* Library;
  const embedder = yield* Embedder;
  const { indexing, current } = yield* library.activity;
  const { packages, images } = yield* failed(progress);
  return {
    version: VERSION,
    device: embedder.device,
    indexing,
    current: Option.getOrNull(current),
    packages,
    images,
  };
});

/** @internal */
const handlersLayer = AredokoRpcs.toLayer(
  Effect.gen(function* handlers() {
    const library = yield* Library;
    const libraryPath = yield* ensureLibraryFolder;
    yield* library.sourcesChanged;
    yield* library.requestScan;
    return AredokoRpcs.of({
      GetStatus: getStatus,
      ListSources: () => failed(listSources).pipe(Effect.map((sources) => ({ sources }))),
      AddSource: ({ path, kind }) =>
        failed(addSource(path, kind)).pipe(
          Effect.tap(() => Effect.andThen(library.sourcesChanged, library.requestScan)),
        ),
      RemoveSource: ({ id }) =>
        failed(removeSource(id)).pipe(Effect.tap(() => library.sourcesChanged)),
      GetLibrary: () =>
        failed(findAssetStore()).pipe(
          Effect.map((assetStore) => ({
            path: libraryPath,
            assetStore: Option.getOrNull(assetStore),
          })),
        ),
      ImportFiles: ({ paths }) =>
        failed(intake(paths)).pipe(
          Effect.tap(() => library.requestScan),
          Effect.map((packages) => ({ packages })),
        ),
      Reindex: () => library.requestScan,
      ListPackages: () =>
        failed(Option.none<number>().pipe(packagesWhere)).pipe(
          Effect.map((packages) => ({ packages })),
        ),
      GetPackage: ({ id }) => packageById(id),
      ListAssets: (request) => failed(browse(request)),
      Search: (request) => failed(search(request)).pipe(Effect.map((results) => ({ results }))),
      GetPreview: ({ assetId }) =>
        preview(assetId).pipe(
          Effect.mapBoth({
            onFailure: () => RequestFailed.make({ reason: "NotFound", message: NO_PREVIEW }),
            onSuccess: (png) => ({ png }),
          }),
        ),
      Extract: extractAssets,
      LinkBooth: linkBoothItem,
      PutProjectAssets: putAssets,
    });
  }),
);

export { VERSION, handlersLayer };
