import { describe, expect, it } from "@effect/vitest";
import { Array, Option, pipe } from "effect";

import { fuse } from "./rrf.ts";

const SHARED = 30;
const ONLY_FIRST = 10;
const ONLY_SECOND = 20;

describe("fuse", () => {
  it("ranks an id found by several lists above ids found by a single list", () => {
    const fused = fuse([
      [ONLY_FIRST, SHARED],
      [ONLY_SECOND, SHARED],
    ]);
    expect(
      pipe(
        Array.head(fused),
        Option.map(([id]) => id),
      ),
    ).toStrictEqual(Option.some(SHARED));
  });
});
