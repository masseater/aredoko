import { Array, Option, pipe } from "effect";
import type { SearchResult } from "protocol";

type Results = readonly (typeof SearchResult.Type)[];

type SearchView =
  | Readonly<{ status: "message"; text: string; tone: "muted" | "error" }>
  | Readonly<{ status: "results"; results: Results }>;

const IDLE = "検索語を入れて Enter を押してください。";
const SEARCHING = "探しています…";
const EMPTY = "見つかりませんでした。";

const viewOfResults = (results: Results): SearchView => {
  if (Array.isReadonlyArrayEmpty(results)) {
    return { status: "message", text: EMPTY, tone: "muted" };
  }
  return { status: "results", results };
};

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
  return pipe(
    results,
    Option.filter(() => phase === "settled"),
    Option.match({
      onNone: (): SearchView => ({ status: "message", text: SEARCHING, tone: "muted" }),
      onSome: viewOfResults,
    }),
  );
};

export { searchViewOf };
