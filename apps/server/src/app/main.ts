import { NodeRuntime, NodeSocketServer } from "@effect/platform-node";
import { Effect, Layer, Schema } from "effect";
import { FetchHttpClient } from "effect/http";
import { OtlpSerialization, OtlpTracer } from "effect/observability";
import { Rpc, RpcGroup, RpcSerialization, RpcServer } from "effect/rpc";

import { Embedder, EmbeddingFailed, Vector, embedderLive } from "#shared/embedding";

const HOST = "127.0.0.1";
const PORT = 52_810;

class EmbeddingRpcs extends RpcGroup.make(
  Rpc.make("EmbedQuery", {
    payload: { query: Schema.String },
    success: Vector,
    error: EmbeddingFailed,
  }),
  Rpc.make("EmbedImage", {
    payload: { path: Schema.String },
    success: Vector,
    error: EmbeddingFailed,
  }),
) {}

const handlers = EmbeddingRpcs.toLayer(
  Effect.gen(function* handlers() {
    const embedder = yield* Embedder;
    return EmbeddingRpcs.of({
      EmbedQuery: ({ query }) => embedder.embedQuery(query),
      EmbedImage: ({ path }) => embedder.embedImage(path),
    });
  }),
);

const tracing = OtlpTracer.layerFromConfig({
  resource: { serviceName: "aredoko-server" },
}).pipe(Layer.provide(OtlpSerialization.layerJson), Layer.provide(FetchHttpClient.layer));

const server = RpcServer.layer(EmbeddingRpcs).pipe(
  Layer.provide(handlers),
  Layer.provide(embedderLive),
  Layer.provide(RpcServer.layerProtocolSocketServer),
  Layer.provide(RpcSerialization.layerJsonRpc()),
  Layer.provide(NodeSocketServer.layerWebSocket({ host: HOST, port: PORT })),
  Layer.provide(tracing),
);

NodeRuntime.runMain(Layer.launch(server));
