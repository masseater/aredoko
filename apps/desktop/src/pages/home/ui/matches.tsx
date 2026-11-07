import { Array } from "effect";
import type { SearchResult } from "protocol";
import type { ReactNode } from "react";

import { NothingFound } from "./nothing-found.tsx";
import { ResultGrid } from "./result-grid.tsx";

const EMPTY = "見つかりませんでした";

type Results = readonly (typeof SearchResult.Type)[];

const Matches = ({ matches }: Readonly<{ matches: Results }>): ReactNode => {
  if (Array.isReadonlyArrayEmpty(matches)) {
    return <NothingFound text={EMPTY} />;
  }
  return <ResultGrid results={matches} />;
};

export { Matches };
