import { Context, Layer } from "effect";
import { RpcClient, RpcSerialization } from "effect/rpc";
import { Socket } from "effect/socket";
import { AredokoRpcs, PORT } from "protocol";

const ENDPOINT = `ws://127.0.0.1:${PORT.toString()}`;

/** @internal */
class Client extends Context.Service<Client>()("search-eval/client", {
  make: RpcClient.make(AredokoRpcs),
}) {}

/** @internal */
const clientLayer = Layer.effect(Client, Client.make).pipe(
  Layer.provide(RpcClient.layerProtocolSocket({ retryTransientErrors: true })),
  Layer.provide(RpcSerialization.layerJsonRpc()),
  Layer.provide(Socket.layerWebSocket(ENDPOINT)),
  Layer.provide(Socket.layerWebSocketConstructorGlobal),
);

export { Client, clientLayer };
