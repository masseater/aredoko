import { NodeSocketServer } from "@effect/platform-node";
import { Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { RpcSerialization, RpcServer } from "effect/rpc";
import { AredokoRpcs, PORT } from "protocol";

import { libraryLayer } from "#features/library";
import { databaseLayer } from "#shared/database";

import { embedderLayer } from "./embedder-layer.ts";
import { handlersLayer } from "./handlers.ts";

const HOST = "127.0.0.1";

const transport = RpcServer.layerProtocolSocketServer.pipe(
  Layer.provide(RpcSerialization.layerJsonRpc()),
  Layer.provide(NodeSocketServer.layerWebSocket({ host: HOST, port: PORT })),
);

/** @internal */
const serverLayer = RpcServer.layer(AredokoRpcs).pipe(
  Layer.provide(handlersLayer),
  Layer.provide(libraryLayer),
  Layer.provide(transport),
  Layer.provideMerge(embedderLayer),
  Layer.provideMerge(databaseLayer),
  Layer.provide(FetchHttpClient.layer),
);

export { serverLayer };
