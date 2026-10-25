import type { ReactNode } from "react";

import { AddFolderButton } from "#/features/add-folder";
import { PageHeader } from "#/shared/ui/page-header";

import { ReindexButton } from "./reindex-button.tsx";
import { SourceList } from "./source-list.tsx";

const TITLE = "探す場所";

const SourcesPage = (): ReactNode => (
  <section className="flex flex-col gap-6">
    <PageHeader title={TITLE} />
    <div className="flex gap-2">
      <AddFolderButton />
      <ReindexButton />
    </div>
    <SourceList />
  </section>
);

export { SourcesPage };
