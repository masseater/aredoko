import type { ReactNode } from "react";

import { PackageFilter } from "./package-filter.tsx";
import { PackageList } from "./package-list.tsx";
import { SourceSection } from "./source-section.tsx";

const LibraryColumn = (): ReactNode => (
  <aside className="flex w-80 shrink-0 flex-col gap-6 overflow-y-auto">
    <SourceSection />
    <div className="flex flex-col gap-2">
      <PackageFilter />
      <PackageList />
    </div>
  </aside>
);

export { LibraryColumn };
