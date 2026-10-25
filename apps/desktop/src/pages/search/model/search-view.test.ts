import { describe, expect, it } from "@effect/vitest";
import { Option } from "effect";

import { searchViewOf } from "./search-view.ts";

const RESULT = {
  assetId: 1,
  guid: "guid",
  pathname: "Assets/cat.png",
  kind: "texture",
  packageId: 1,
  packageName: "Cats",
  packageKind: "unitypackage",
  score: 1,
  hasPreview: true,
} as const;

describe("searchViewOf", () => {
  it("asks for a query before anything is searched", () => {
    const view = searchViewOf({ phase: "idle", failure: Option.none(), results: Option.none() });
    expect(view).toMatchObject({ status: "message", tone: "muted" });
  });

  it("shows the failure message", () => {
    const view = searchViewOf({
      phase: "settled",
      failure: Option.some("サーバーに接続できません"),
      results: Option.none(),
    });
    expect(view).toStrictEqual({
      status: "message",
      text: "サーバーに接続できません",
      tone: "error",
    });
  });

  it("waits while searching", () => {
    const view = searchViewOf({
      phase: "searching",
      failure: Option.none(),
      results: Option.none(),
    });
    expect(view).toMatchObject({ status: "message", tone: "muted" });
  });

  it("says nothing was found for an empty result", () => {
    const view = searchViewOf({
      phase: "settled",
      failure: Option.none(),
      results: Option.some([]),
    });
    expect(view).toMatchObject({ status: "message", tone: "muted" });
  });

  it("returns the results", () => {
    const view = searchViewOf({
      phase: "settled",
      failure: Option.none(),
      results: Option.some([RESULT]),
    });
    expect(view).toStrictEqual({ status: "results", results: [RESULT] });
  });
});
