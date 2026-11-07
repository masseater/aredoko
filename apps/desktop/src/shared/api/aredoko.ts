import { convertFileSrc } from "@tauri-apps/api/core";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import {
  ConfigProvider,
  Duration,
  Effect,
  Layer,
  ManagedRuntime,
  Option,
  Predicate,
  Record,
  Schema,
  pipe,
} from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";
import { OtlpSerialization, OtlpTracer } from "effect/observability";
import {
  AredokoClient,
  ENDPOINT_FILE,
  ServerUrl,
  aredokoClientLayer,
  awaitEndpoint,
} from "protocol";
import type { AssetKind, Package, SearchResult, Source, SourceKind, Status } from "protocol";

import { ServerError } from "./server-error.ts";

const STATUS_TIMEOUT = Duration.fromInputUnsafe("3 seconds");
const REQUEST_TIMEOUT = Duration.fromInputUnsafe("15 seconds");
const UNREACHABLE = "接続できません";

const unreachable = (): ServerError => ServerError.make({ message: UNREACHABLE });

const serverUrlLayer = Layer.effect(
  ServerUrl,
  Effect.gen(function* serverUrl() {
    const httpClient = yield* HttpClient.HttpClient;
    const client = HttpClient.filterStatusOk(httpClient);
    const endpointFile = Effect.gen(function* endpointFile() {
      const directory = yield* Effect.tryPromise({ try: appLocalDataDir, catch: unreachable });
      const file = yield* Effect.tryPromise({
        try: () => join(directory, ENDPOINT_FILE),
        catch: unreachable,
      });
      const response = yield* client.get(convertFileSrc(file));
      return yield* response.text;
    }).pipe(
      Effect.provideService(FetchHttpClient.RequestInit, { cache: "no-store" }),
      Effect.provideService(HttpClient.TracerPropagationEnabled, false),
    );
    return { url: awaitEndpoint(endpointFile) };
  }),
);

const SERVICE_NAME = "aredoko-desktop";

const viteEnv = pipe(import.meta.env, Record.filter(Predicate.isString));

const configLayer = ConfigProvider.layer(ConfigProvider.fromEnv({ env: viteEnv }));

const tracingLayer = OtlpTracer.layerFromConfig({ resource: { serviceName: SERVICE_NAME } }).pipe(
  Layer.provide(OtlpSerialization.layerJson),
  Layer.provide(configLayer),
);

const clientLayer = aredokoClientLayer.pipe(Layer.provide(serverUrlLayer));

const runtime = ManagedRuntime.make(
  Layer.mergeAll(clientLayer, tracingLayer).pipe(Layer.provide(FetchHttpClient.layer)),
);

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

interface LibraryInfo {
  readonly path: string;
  readonly assetStore: Option.Option<string>;
  readonly blm: Option.Option<string>;
}

const getLibrary = (): Promise<LibraryInfo> =>
  run(
    Effect.gen(function* getLibraryRequest() {
      const { GetLibrary: getLibraryRpc } = yield* AredokoClient;
      const { path, assetStore, blm } = yield* getLibraryRpc();
      return { path, assetStore: Option.fromNullOr(assetStore), blm: Option.fromNullOr(blm) };
    }),
  );

const importFiles = (paths: readonly string[]): Promise<number> =>
  run(
    Effect.gen(function* importFilesRequest() {
      const { ImportFiles: importFilesRpc } = yield* AredokoClient;
      const { packages } = yield* importFilesRpc({ paths });
      return packages;
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
  readonly packageId: number | null;
}): Promise<readonly (typeof SearchResult.Type)[]> =>
  run(
    Effect.gen(function* searchRequest() {
      const { Search: searchRpc } = yield* AredokoClient;
      const { results } = yield* searchRpc(query);
      return results;
    }),
  );

const listAssets = (query: {
  readonly packageId: number | null;
  readonly kinds: readonly (typeof AssetKind.Type)[];
  readonly offset: number;
  readonly limit: number;
}): Promise<Readonly<{ assets: readonly (typeof SearchResult.Type)[]; total: number }>> =>
  run(
    Effect.gen(function* listAssetsRequest() {
      const { ListAssets: listAssetsRpc } = yield* AredokoClient;
      return yield* listAssetsRpc(query);
    }),
  );

const extract = (
  assetIds: readonly number[],
): Promise<Readonly<{ path: string; assets: number }>> =>
  run(
    Effect.gen(function* extractRequest() {
      const { Extract: extractRpc } = yield* AredokoClient;
      const { path, assets } = yield* extractRpc({ assetIds });
      return { path, assets };
    }),
  );

const listRenderJobs = (): Promise<readonly Readonly<{ assetId: number; pathname: string }>[]> =>
  run(
    Effect.gen(function* listRenderJobsRequest() {
      const { ListRenderJobs: listRenderJobsRpc } = yield* AredokoClient;
      const { jobs } = yield* listRenderJobsRpc();
      return jobs;
    }),
  );

const readModel = (
  assetId: number,
): Promise<
  Readonly<{ model: Uint8Array; files: readonly Readonly<{ name: string; data: Uint8Array }>[] }>
> =>
  run(
    Effect.gen(function* readModelRequest() {
      const { ReadModel: readModelRpc } = yield* AredokoClient;
      return yield* readModelRpc({ assetId });
    }),
  );

const putRender = (rendered: {
  readonly assetId: number;
  readonly pngs: readonly Uint8Array[];
}): Promise<void> =>
  run(
    Effect.gen(function* putRenderRequest() {
      const { PutRender: putRenderRpc } = yield* AredokoClient;
      yield* putRenderRpc(rendered);
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
  extract,
  getPreview,
  getLibrary,
  getStatus,
  importFiles,
  linkBooth,
  listAssets,
  listPackages,
  listRenderJobs,
  listSources,
  putRender,
  readModel,
  removeSource,
  search,
};
export type { LibraryInfo };
