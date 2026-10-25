import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";

import { EmbeddingFailed } from "./embedding-failed.ts";
import { Vector } from "./vector.ts";

/** @internal */
export class EmbeddingRpcs extends RpcGroup.make(
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
