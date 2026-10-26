import type { ReactNode } from "react";

import { useQueryText } from "#/pages/home/model";

import { PackageDetail } from "./package-detail.tsx";
import { SearchResults } from "./search-results.tsx";

const MainPane = (): ReactNode => {
  if (useQueryText() === "") {
    return <PackageDetail />;
  }
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <SearchResults />
    </div>
  );
};

export { MainPane };
