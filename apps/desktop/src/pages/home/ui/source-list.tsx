import { Array, pipe } from "effect";
import type { ReactNode } from "react";

import { useSources } from "#/shared/api";

import { SourceRow } from "./source-row.tsx";

const LOADING = "読み込んでいます…";

const SourceList = (): ReactNode => {
  const sources = useSources();
  if (sources.isPending) {
    return <p className="text-muted-foreground text-sm">{LOADING}</p>;
  }
  if (sources.isError) {
    return <p className="text-destructive text-sm">{sources.error.message}</p>;
  }
  return (
    <ul className="flex flex-col gap-1">
      {pipe(
        sources.data,
        Array.map((source) => <SourceRow key={source.id} source={source} />),
      )}
    </ul>
  );
};

export { SourceList };
