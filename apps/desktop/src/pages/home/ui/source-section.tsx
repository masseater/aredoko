import type { ReactNode } from "react";

import { AddFolderButton } from "./add-folder-button.tsx";
import { SourceList } from "./source-list.tsx";

const SourceSection = (): ReactNode => (
  <section className="flex flex-col gap-2">
    <SourceList />
    <AddFolderButton />
  </section>
);

export { SourceSection };
