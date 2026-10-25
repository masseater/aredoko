import { Effect, Schema } from "effect";

const encode = Schema.encodeUnknownEffect(Schema.fromJsonString(Schema.Unknown));

/** @internal */
const encodeJson = Effect.fn("encodeJson")(function* encodeJsonText(value: unknown) {
  return yield* encode(value);
});

export { encodeJson };
