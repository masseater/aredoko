import { Array, Option, pipe } from "effect";
import type { SearchResult } from "protocol";

type Results = readonly (typeof SearchResult.Type)[];

type SearchView =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "message"; text: string; tone: "muted" | "error" }>
  | Readonly<{ status: "results"; matches: Results; others: Results }>;

const SEARCHING = "探しています…";
const EMPTY = "見つかりませんでした";
const MATCH_FLOOR = 0.72;

const viewOfResults = (results: Results): SearchView => {
  if (Array.isReadonlyArrayEmpty(results)) {
    return { status: "message", text: EMPTY, tone: "muted" };
  }
  const isMatch = ({ score }: (typeof results)[number]): boolean => score >= MATCH_FLOOR;
  return {
    status: "results",
    matches: pipe(results, Array.filter(isMatch)),
    others: pipe(
      results,
      Array.filter((result) => !isMatch(result)),
    ),
  };
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
    return { status: "idle" };
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
export type { SearchView };
