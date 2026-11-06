import type { ReactNode } from "react";

import { AddAssetStoreButton } from "./add-asset-store-button.tsx";
import { AddFolderButton } from "./add-folder-button.tsx";
import { ImportResult } from "./import-result.tsx";
import { PickFilesButton } from "./pick-files-button.tsx";
import { SourceList } from "./source-list.tsx";

const SourceSection = (): ReactNode => (
  <section className="flex flex-col gap-2">
    <SourceList />
    <div className="flex flex-wrap gap-2">
      <PickFilesButton />
      <AddAssetStoreButton />
      <AddFolderButton />
    </div>
    <ImportResult />
  </section>
);

export { SourceSection };
