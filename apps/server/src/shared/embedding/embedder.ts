import { AutoConfig, AutoModel, AutoProcessor, RawImage, Tensor } from "@huggingface/transformers";
import { Context, Effect, Layer, Schema } from "effect";

import { EmbeddingFailed } from "./embedding-failed.ts";

const MODEL_ID = "onnx-community/embeddinggemma-2-ONNX";
const DTYPE = "q4";

const Vector = Schema.Array(Schema.Finite);

class Embedder extends Context.Service<
  Embedder,
  {
    readonly embedQuery: (query: string) => Effect.Effect<typeof Vector.Type, EmbeddingFailed>;
    readonly embedImage: (path: string) => Effect.Effect<typeof Vector.Type, EmbeddingFailed>;
  }
>()("server/shared/embedding/embedder") {}

const failed = (cause: unknown): EmbeddingFailed => EmbeddingFailed.make({ cause });

const attempt = <Value>(evaluate: () => Promise<Value>): Effect.Effect<Value, EmbeddingFailed> =>
  Effect.tryPromise({ try: evaluate, catch: failed });

const decodeOutput = Schema.decodeUnknownEffect(
  Schema.Struct({ sentence_embedding: Schema.instanceOf(Tensor) }),
);

const decodeRows = Schema.decodeUnknownEffect(Schema.Tuple([Vector]));

const decodeImageToken = Schema.decodeUnknownEffect(Schema.String);

const queryPrompt = (query: string): string => `task: search result | query: ${query}`;

const embedderLive = Layer.effect(
  Embedder,
  Effect.gen(function* embedder() {
    const config = yield* attempt(() => AutoConfig.from_pretrained(MODEL_ID));
    Reflect.deleteProperty(config, "audio_config");
    const processor = yield* attempt(() => AutoProcessor.from_pretrained(MODEL_ID));
    const imageToken = yield* decodeImageToken(Reflect.get(processor, "image_token")).pipe(
      Effect.mapError(failed),
    );
    const model = yield* attempt(() =>
      AutoModel.from_pretrained(MODEL_ID, { config, device: "cpu", dtype: DTYPE }),
    );
    const embed = Effect.fn("embed")(function* embed(prepare: () => Promise<unknown>) {
      const inputs = yield* attempt(prepare);
      const output = yield* attempt(() => Promise.resolve<unknown>(model(inputs)));
      const { sentence_embedding: embedding } = yield* decodeOutput(output).pipe(
        Effect.mapError(failed),
      );
      const [vector] = yield* decodeRows(embedding.tolist()).pipe(Effect.mapError(failed));
      return vector;
    });
    return Embedder.of({
      embedQuery: (query) => embed(() => Promise.resolve<unknown>(processor([queryPrompt(query)]))),
      embedImage: Effect.fn("embedImage")(function* embedImage(path: string) {
        const image = yield* attempt(() => RawImage.read(path));
        return yield* embed(() => Promise.resolve<unknown>(processor(imageToken, [[image]])));
      }),
    });
  }),
);

export { Embedder, Vector, embedderLive };
