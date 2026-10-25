import { Context, Layer } from "effect";
import { RpcClient, RpcSerialization } from "effect/rpc";
import { Socket } from "effect/socket";

import { AredokoRpcs } from "./aredoko-rpcs.ts";
import { PORT } from "./port.ts";

const ENDPOINT = `ws://127.0.0.1:${PORT.toString()}`;

/** @internal */
class AredokoClient extends Context.Service<AredokoClient>()("protocol/client/AredokoClient", {
  make: RpcClient.make(AredokoRpcs),
}) {}

/** @internal */
const aredokoClientLayer = Layer.effect(AredokoClient, AredokoClient.make).pipe(
  Layer.provide(RpcClient.layerProtocolSocket({ retryTransientErrors: true })),
  Layer.provide(RpcSerialization.layerJsonRpc()),
  Layer.provide(Socket.layerWebSocket(ENDPOINT)),
  Layer.provide(Socket.layerWebSocketConstructorGlobal),
);

export { AredokoClient, aredokoClientLayer };
