import type { ReactNode } from "react";

import { PackageFilter } from "./package-filter.tsx";
import { PackageList } from "./package-list.tsx";

const PackageColumn = (): ReactNode => (
  <div className="flex w-80 shrink-0 flex-col gap-2 overflow-y-auto">
    <PackageFilter />
    <PackageList />
  </div>
);

export { PackageColumn };
