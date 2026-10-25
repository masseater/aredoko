import { NodeRuntime, NodeSocketServer } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { OtlpSerialization, OtlpTracer } from "effect/observability";
import { RpcSerialization, RpcServer } from "effect/rpc";
import { EmbeddingRpcs } from "protocol";

import { Embedder, embedderLive } from "#shared/embedding";

const HOST = "127.0.0.1";
const PORT = 52_810;

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
