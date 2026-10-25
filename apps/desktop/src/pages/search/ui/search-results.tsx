import { Option, pipe } from "effect";
import type { ReactNode } from "react";

import { searchViewOf, useKinds, useQueryText } from "#/pages/search/model";
import { useSearch } from "#/shared/api";
import { cn } from "#/shared/lib/utils";

import { ResultGrid } from "./result-grid.tsx";

const phaseOf = ({
  isPending,
  fetchStatus,
}: Readonly<{ isPending: boolean; fetchStatus: string }>): "idle" | "searching" | "settled" => {
  if (!isPending) {
    return "settled";
  }
  if (fetchStatus === "idle") {
    return "idle";
  }
  return "searching";
};

const SearchResults = (): ReactNode => {
  const query = useQueryText();
  const kinds = useKinds();
  const search = useSearch({ query, kinds });
  const view = searchViewOf({
    phase: phaseOf(search),
    failure: pipe(
      Option.fromNullOr(search.error),
      Option.map(({ message }) => message),
    ),
    results: Option.fromUndefinedOr(search.data),
  });
  if (view.status === "results") {
    return <ResultGrid results={view.results} />;
  }
  return (
    <p
      className={cn(
        "text-sm",
        view.tone === "error" && "text-destructive",
        view.tone === "muted" && "text-muted-foreground",
      )}
    >
      {view.text}
    </p>
  );
};

export { SearchResults };
