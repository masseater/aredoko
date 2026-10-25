import { Effect, Layer } from "effect";
import { Command, Flag } from "effect/cli";
import { runMain } from "runtime";

import { Settings } from "#shared/settings";

import { VERSION } from "./rpc/handlers.ts";
import { serverLayer } from "./rpc/server-layer.ts";

const command = Command.make(
  "aredoko-server",
  {
    dataDirectory: Flag.String("data-dir"),
    modelDirectory: Flag.String("model-dir").pipe(Flag.optional),
  },
  (settings) =>
    Layer.launch(serverLayer).pipe(Effect.provideService(Settings, Settings.of(settings))),
);

runMain("aredoko-server")(Command.run(command, { version: VERSION }));
