import type { ReactNode } from "react";

import { LibraryColumn } from "./library-column.tsx";
import { PackageDetail } from "./package-detail.tsx";

const LibraryView = (): ReactNode => (
  <div className="flex min-h-0 flex-1 gap-6">
    <LibraryColumn />
    <PackageDetail />
  </div>
);

export { LibraryView };
