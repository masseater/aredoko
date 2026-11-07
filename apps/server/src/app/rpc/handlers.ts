import { Effect, Option } from "effect";
import { AredokoRpcs, RequestFailed } from "protocol";

import { addSource, listSources, preview, progress, removeSource } from "#features/catalog";
import { ensureLibraryFolder, intake, rememberAssetStore } from "#features/intake";
import { Library } from "#features/library";
import { putRender, readModel, renderJobs } from "#features/render";
import { browse, search } from "#features/search";
import { Embedder } from "#shared/embedding";

import {
  extractAssets,
  libraryInfo,
  linkBoothItem,
  listPackages,
  packageById,
  putAssets,
} from "./package-handlers.ts";
import { failed } from "./request-failed.ts";

const VERSION = "0.1.0";
const NO_PREVIEW = "プレビューがありません";

const getStatus = Effect.fn("GetStatus")(function* status() {
  const library = yield* Library;
  const embedder = yield* Embedder;
  const { indexing, current, analyzing } = yield* library.activity;
  const { packages, images } = yield* failed(progress);
  return {
    version: VERSION,
    device: embedder.device,
    indexing,
    current: Option.getOrNull(current),
    analyzingAssetIds: analyzing,
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
      GetLibrary: () => libraryInfo(libraryPath),
      ImportFiles: ({ paths }) =>
        failed(intake(paths)).pipe(
          Effect.tap(() => library.requestScan),
          Effect.map((packages) => ({ packages })),
        ),
      Reindex: () => library.requestScan,
      ListPackages: listPackages,
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
      ListRenderJobs: () => failed(renderJobs()).pipe(Effect.map((jobs) => ({ jobs }))),
      ReadModel: ({ assetId }) => failed(readModel(assetId)),
      PutAssetStore: ({ path }) => failed(rememberAssetStore(path)),
      PutRender: (rendered) =>
        failed(putRender(rendered)).pipe(Effect.tap(() => library.requestScan)),
    });
  }),
);

export { VERSION, handlersLayer };
