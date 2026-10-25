import type { ReactNode } from "react";

import { PageHeader } from "#/shared/ui/page-header";

import { PackageColumn } from "./package-column.tsx";
import { PackageDetail } from "./package-detail.tsx";

const TITLE = "ライブラリ";

const LibraryPage = (): ReactNode => (
  <section className="flex min-h-0 flex-1 flex-col gap-6">
    <PageHeader title={TITLE} />
    <div className="flex min-h-0 flex-1 gap-6">
      <PackageColumn />
      <PackageDetail />
    </div>
  </section>
);

export { LibraryPage };
