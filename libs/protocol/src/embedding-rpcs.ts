import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";

import { EmbeddingFailed } from "./embedding-failed.ts";
import { Embedding } from "./embedding.ts";

/** @internal */
export class EmbeddingRpcs extends RpcGroup.make(
  Rpc.make("EmbedQuery", {
    payload: { query: Schema.String },
    success: Embedding,
    error: EmbeddingFailed,
  }),
  Rpc.make("EmbedImage", {
    payload: { path: Schema.String },
    success: Embedding,
    error: EmbeddingFailed,
  }),
) {}
