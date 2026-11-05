import { Array } from "effect";
import type { ReactNode } from "react";

import { useSources } from "#/pages/home/api/queries";

import { FirstFolder } from "./first-folder.tsx";
import { LibraryColumn } from "./library-column.tsx";
import { PackageDetail } from "./package-detail.tsx";

const LibraryView = (): ReactNode => {
  const sources = useSources();
  if (sources.isSuccess && Array.isReadonlyArrayEmpty(sources.data)) {
    return <FirstFolder />;
  }
  return (
    <div className="flex min-h-0 flex-1 gap-6">
      <LibraryColumn />
      <PackageDetail />
    </div>
  );
};

export { LibraryView };
