import type { ReactNode } from "react";

import { PageHeader } from "#/shared/ui/page-header";

import { PackageColumn } from "./package-column.tsx";
import { PackageDetail } from "./package-detail.tsx";

const TITLE = "ライブラリ";
const DESCRIPTION =
  "索引に入っているパッケージです。BOOTH の商品ページを紐づけると、商品名でも探せます。";

const LibraryPage = (): ReactNode => (
  <section className="flex min-h-0 flex-1 flex-col gap-6">
    <PageHeader title={TITLE} description={DESCRIPTION} />
    <div className="flex min-h-0 flex-1 gap-6">
      <PackageColumn />
      <PackageDetail />
    </div>
  </section>
);

export { LibraryPage };
