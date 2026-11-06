import { Array } from "effect";
import type { ReactNode } from "react";

import { usePackages } from "#/pages/home/api/queries";

import { FirstImport } from "./first-import.tsx";
import { LibraryColumn } from "./library-column.tsx";
import { PackageDetail } from "./package-detail.tsx";

const LibraryView = (): ReactNode => {
  const packages = usePackages();
  if (packages.isSuccess && Array.isReadonlyArrayEmpty(packages.data)) {
    return <FirstImport />;
  }
  return (
    <div className="flex min-h-0 flex-1 gap-6">
      <LibraryColumn />
      <PackageDetail />
    </div>
  );
};

export { LibraryView };
