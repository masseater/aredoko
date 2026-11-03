import { D1, Website, providers, state } from "@alchemy.run/cloudflare";
import type { InferEnv } from "@alchemy.run/cloudflare";
import { Stack, makeRandom } from "alchemy";
import { Effect } from "effect";

import { APP_NAME, requireAppPrefix } from "./app-name.ts";

const TRACE_SAMPLING_RATE = 0.1;

const COMPATIBILITY = { date: "2026-08-25" } as const;

const web = Effect.gen(function* web() {
  const DB = yield* D1.Database("DB", { migrations: "./drizzle" });
  const BETTER_AUTH_SECRET = yield* makeRandom("BetterAuthSecret");
  return yield* Website.Vite("Web", {
    compatibility: COMPATIBILITY,
    logpush: true,
    env: { BETTER_AUTH_SECRET, DB },
    observability: {
      enabled: true,
      logs: {
        enabled: true,
        invocationLogs: true,
        persist: true,
      },
      traces: { enabled: true, headSamplingRate: TRACE_SAMPLING_RATE, persist: true },
    },
    viteEnvironments: { entry: "ssr", children: ["rsc"] },
  });
});

type WebEnv = InferEnv<typeof web>;

export type { WebEnv };
export default Stack(
  APP_NAME,
  { providers: providers(), state: state() },
  Effect.gen(function* stack() {
    yield* requireAppPrefix;
    return {};
  }),
);
