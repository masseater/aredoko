import { Effect, FileSystem, Path, Schema } from "effect";
import { Command, Flag } from "effect/cli";
import { runMain } from "runtime";

import { csharp } from "./csharp.ts";

const OUTPUT = "../../apps/unity/Packages/dev.masseater.aredoko/Editor/Protocol/Protocol.g.cs";
const TAURI_CONFIG = new URL("../../../apps/desktop/src-tauri/tauri.conf.json", import.meta.url);

const decodeTauriConfig = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Struct({ identifier: Schema.String })),
);

const taggedError = Schema.TaggedError;

class StaleProtocol extends taggedError<StaleProtocol, { readonly brand: unique symbol }>()(
  "StaleProtocol",
  { path: Schema.String },
) {}

const appIdentifier = Effect.fn("appIdentifier")(function* appIdentifier() {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const config = yield* fileSystem.readFileString(yield* path.fromFileUrl(TAURI_CONFIG));
  const { identifier } = yield* decodeTauriConfig(config);
  return identifier;
});

const write = Effect.fn("write")(function* write(source: string) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fileSystem.makeDirectory(path.dirname(OUTPUT), { recursive: true });
  yield* fileSystem.writeFileString(OUTPUT, source);
});

const verify = Effect.fn("verify")(function* verify(source: string) {
  const fileSystem = yield* FileSystem.FileSystem;
  yield* Effect.filterOrFail(
    fileSystem.readFileString(OUTPUT),
    (current) => current === source,
    () => StaleProtocol.make({ path: OUTPUT }),
  );
});

const command = Command.make(
  "protocol-codegen",
  { check: Flag.Boolean("check").pipe(Flag.withDefault(false)) },
  ({ check }) =>
    Effect.gen(function* codegen() {
      const source = yield* csharp(yield* appIdentifier());
      if (check) {
        return yield* verify(source);
      }
      return yield* write(source);
    }),
);

runMain("protocol-codegen")(Command.run(command, { version: "0.0.0" }));
