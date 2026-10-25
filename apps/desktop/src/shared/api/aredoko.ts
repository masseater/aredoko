import { Context, Duration, Effect, Layer, ManagedRuntime, Schema } from "effect";
import { RpcClient, RpcSerialization } from "effect/rpc";
import { Socket } from "effect/socket";
import { AredokoRpcs, PORT } from "protocol";
import type { AssetKind, Package, SearchResult, Source, SourceKind, Status } from "protocol";

import { ServerError } from "./server-error.ts";

const ENDPOINT = `ws://127.0.0.1:${PORT.toString()}`;
const STATUS_TIMEOUT = Duration.fromInputUnsafe("3 seconds");
const UNREACHABLE = "サーバーに接続できません";

class Client extends Context.Service<Client>()("desktop/shared/api/aredoko/Client", {
  make: RpcClient.make(AredokoRpcs),
}) {}

const clientLayer = Layer.effect(Client, Client.make).pipe(
  Layer.provide(RpcClient.layerProtocolSocket({ retryTransientErrors: true })),
  Layer.provide(RpcSerialization.layerJsonRpc()),
  Layer.provide(Socket.layerWebSocket(ENDPOINT)),
  Layer.provide(Socket.layerWebSocketConstructorGlobal),
);

const runtime = ManagedRuntime.make(clientLayer);

const run = <Value>(
  request: Effect.Effect<Value, { readonly message: string }, Client>,
): Promise<Value> =>
  runtime.runPromise(request.pipe(Effect.mapError(({ message }) => ServerError.make({ message }))));

const getStatus = (): Promise<typeof Status.Type> =>
  run(
    Effect.gen(function* getStatusRequest() {
      const { GetStatus: getStatusRpc } = yield* Client;
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
      const { ListSources: listSourcesRpc } = yield* Client;
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
      const { AddSource: addSourceRpc } = yield* Client;
      return yield* addSourceRpc(source);
    }),
  );

const removeSource = (id: number): Promise<void> =>
  run(
    Effect.gen(function* removeSourceRequest() {
      const { RemoveSource: removeSourceRpc } = yield* Client;
      yield* removeSourceRpc({ id });
    }),
  );

const reindex = (): Promise<void> =>
  run(
    Effect.gen(function* reindexRequest() {
      const { Reindex: reindexRpc } = yield* Client;
      yield* reindexRpc();
    }),
  );

const listPackages = (): Promise<readonly (typeof Package.Type)[]> =>
  run(
    Effect.gen(function* listPackagesRequest() {
      const { ListPackages: listPackagesRpc } = yield* Client;
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
      const { LinkBooth: linkBoothRpc } = yield* Client;
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
      const { Search: searchRpc } = yield* Client;
      const { results } = yield* searchRpc(query);
      return results;
    }),
  );

const encodeBase64 = Schema.encodeEffect(Schema.Uint8ArrayFromBase64);

const getPreview = (assetId: number): Promise<string> =>
  run(
    Effect.gen(function* getPreviewRequest() {
      const { GetPreview: getPreviewRpc } = yield* Client;
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
