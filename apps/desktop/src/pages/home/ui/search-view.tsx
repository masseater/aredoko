import type { ReactNode } from "react";

import { ResultDetail } from "./result-detail.tsx";
import { SearchResults } from "./search-results.tsx";

const SearchView = (): ReactNode => (
  <div className="flex min-h-0 flex-1 gap-6">
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <SearchResults />
    </div>
    <ResultDetail />
  </div>
);

export { SearchView };
