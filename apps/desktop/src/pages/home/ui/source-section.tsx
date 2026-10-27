import type { ReactNode } from "react";

import { AddFolderButton } from "./add-folder-button.tsx";
import { ReindexButton } from "./reindex-button.tsx";
import { SourceList } from "./source-list.tsx";

const SourceSection = (): ReactNode => (
  <section className="flex flex-col gap-2">
    <SourceList />
    <div className="flex flex-wrap gap-2">
      <AddFolderButton />
      <ReindexButton />
    </div>
  </section>
);

export { SourceSection };
