import { Effect, Option } from "effect";
import { AredokoRpcs, RequestFailed } from "protocol";

import { packagesWhere } from "#entities/package";
import { addSource, listSources, preview, progress, removeSource } from "#features/catalog";
import { Library } from "#features/library";
import { search } from "#features/search";
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
    return AredokoRpcs.of({
      GetStatus: getStatus,
      ListSources: () => failed(listSources).pipe(Effect.map((sources) => ({ sources }))),
      AddSource: ({ path, kind }) =>
        failed(addSource(path, kind)).pipe(Effect.tap(() => library.requestScan)),
      RemoveSource: ({ id }) => failed(removeSource(id)),
      Reindex: () => library.requestScan,
      ListPackages: () =>
        failed(Option.none<number>().pipe(packagesWhere)).pipe(
          Effect.map((packages) => ({ packages })),
        ),
      GetPackage: ({ id }) => packageById(id),
      Search: (request) => failed(search(request)).pipe(Effect.map((results) => ({ results }))),
      GetPreview: ({ assetId }) =>
        preview(assetId).pipe(
          Effect.map((png) => ({ png })),
          Effect.mapError(() => RequestFailed.make({ reason: "NotFound", message: NO_PREVIEW })),
        ),
      Extract: extractAssets,
      LinkBooth: linkBoothItem,
      PutProjectAssets: putAssets,
    });
  }),
);

export { VERSION, handlersLayer };
