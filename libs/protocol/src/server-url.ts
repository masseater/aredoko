import { Context } from "effect";
import type { Effect } from "effect";

/** @internal */
class ServerUrl extends Context.Service<ServerUrl, { readonly url: Effect.Effect<string> }>()(
  "protocol/server-url/ServerUrl",
) {}

export { ServerUrl };
