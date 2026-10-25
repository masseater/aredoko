import { Duration, Effect, ManagedRuntime, Schema } from "effect";
import { AredokoClient, aredokoClientLayer } from "protocol";
import type { AssetKind, Package, SearchResult, Source, SourceKind, Status } from "protocol";

import { ServerError } from "./server-error.ts";

const STATUS_TIMEOUT = Duration.fromInputUnsafe("3 seconds");
const REQUEST_TIMEOUT = Duration.fromInputUnsafe("15 seconds");
const UNREACHABLE = "サーバーに接続できません";

const runtime = ManagedRuntime.make(aredokoClientLayer);

const run = <Value>(
  request: Effect.Effect<Value, { readonly message: string }, AredokoClient>,
): Promise<Value> =>
  runtime.runPromise(
    request.pipe(
      Effect.timeoutOrElse({
        duration: REQUEST_TIMEOUT,
        orElse: () => Effect.fail({ message: UNREACHABLE }),
      }),
      Effect.mapError(({ message }) => ServerError.make({ message })),
    ),
  );

const getStatus = (): Promise<typeof Status.Type> =>
  run(
    Effect.gen(function* getStatusRequest() {
      const { GetStatus: getStatusRpc } = yield* AredokoClient;
      return yield* getStatusRpc();
    }).pipe(
      Effect.timeoutOrElse({
        duration: STATUS_TIMEOUT,
        orElse: () => Effect.fail({ message: UNREACHABLE }),
      }),
    ),
  );

const listSources = (): Promise<readonly (typeof Source.Type)[]> =>
  run(
    Effect.gen(function* listSourcesRequest() {
      const { ListSources: listSourcesRpc } = yield* AredokoClient;
      const { sources } = yield* listSourcesRpc();
      return sources;
    }),
  );

const addSource = (source: {
  readonly path: string;
  readonly kind: typeof SourceKind.Type;
}): Promise<typeof Source.Type> =>
  run(
    Effect.gen(function* addSourceRequest() {
      const { AddSource: addSourceRpc } = yield* AredokoClient;
      return yield* addSourceRpc(source);
    }),
  );

const removeSource = (id: number): Promise<void> =>
  run(
    Effect.gen(function* removeSourceRequest() {
      const { RemoveSource: removeSourceRpc } = yield* AredokoClient;
      yield* removeSourceRpc({ id });
    }),
  );

const reindex = (): Promise<void> =>
  run(
    Effect.gen(function* reindexRequest() {
      const { Reindex: reindexRpc } = yield* AredokoClient;
      yield* reindexRpc();
    }),
  );

const listPackages = (): Promise<readonly (typeof Package.Type)[]> =>
  run(
    Effect.gen(function* listPackagesRequest() {
      const { ListPackages: listPackagesRpc } = yield* AredokoClient;
      const { packages } = yield* listPackagesRpc();
      return packages;
    }),
  );

const linkBooth = (link: {
  readonly packageId: number;
  readonly url: string;
}): Promise<typeof Package.Type> =>
  run(
    Effect.gen(function* linkBoothRequest() {
      const { LinkBooth: linkBoothRpc } = yield* AredokoClient;
      return yield* linkBoothRpc(link);
    }),
  );

const search = (query: {
  readonly query: string;
  readonly kinds: readonly (typeof AssetKind.Type)[];
  readonly limit: number;
}): Promise<readonly (typeof SearchResult.Type)[]> =>
  run(
    Effect.gen(function* searchRequest() {
      const { Search: searchRpc } = yield* AredokoClient;
      const { results } = yield* searchRpc(query);
      return results;
    }),
  );

const encodeBase64 = Schema.encodeEffect(Schema.Uint8ArrayFromBase64);

const getPreview = (assetId: number): Promise<string> =>
  run(
    Effect.gen(function* getPreviewRequest() {
      const { GetPreview: getPreviewRpc } = yield* AredokoClient;
      const { png } = yield* getPreviewRpc({ assetId });
      const base64 = yield* encodeBase64(png);
      return `data:image/png;base64,${base64}`;
    }),
  );

export {
  addSource,
  getPreview,
  getStatus,
  linkBooth,
  listPackages,
  listSources,
  reindex,
  removeSource,
  search,
};
