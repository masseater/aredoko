import { Array } from "effect";
import type { SearchResult } from "protocol";
import type { ReactNode } from "react";

import { ResultGrid } from "./result-grid.tsx";
import { StillImporting } from "./still-importing.tsx";

const EMPTY = "見つかりませんでした。";

type Results = readonly (typeof SearchResult.Type)[];

const Matches = ({ matches }: Readonly<{ matches: Results }>): ReactNode => {
  if (Array.isReadonlyArrayEmpty(matches)) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">{EMPTY}</p>
        <StillImporting />
      </div>
    );
  }
  return <ResultGrid results={matches} />;
};

export { Matches };
