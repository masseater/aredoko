import { Array, Option } from "effect";
import type { SearchResult } from "protocol";

type Results = readonly (typeof SearchResult.Type)[];

type SearchView =
  | Readonly<{ status: "message"; text: string; tone: "muted" | "error" }>
  | Readonly<{ status: "results"; results: Results }>;

const IDLE = "検索語を入れて Enter を押してください。";
const SEARCHING = "探しています…";
const EMPTY = "見つかりませんでした。";

const searchViewOf = ({
  phase,
  failure,
  results,
}: Readonly<{
  phase: "idle" | "searching" | "settled";
  failure: Option.Option<string>;
  results: Option.Option<Results>;
}>): SearchView => {
  if (phase === "idle") {
    return { status: "message", text: IDLE, tone: "muted" };
  }
  if (Option.isSome(failure)) {
    return { status: "message", text: failure.value, tone: "error" };
  }
  if (phase === "searching" || Option.isNone(results)) {
    return { status: "message", text: SEARCHING, tone: "muted" };
  }
  if (Array.isReadonlyArrayEmpty(results.value)) {
    return { status: "message", text: EMPTY, tone: "muted" };
  }
  return { status: "results", results: results.value };
};

export { searchViewOf };
export type { SearchView };
