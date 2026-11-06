import type { ReactNode } from "react";

import { AddAssetStoreButton, AddFolderButton, SourceList } from "#/features/library";

const TITLE = "フォルダ";

const FolderSetting = (): ReactNode => (
  <section className="flex flex-col gap-2">
    <h3 className="text-sm font-medium">{TITLE}</h3>
    <SourceList />
    <div className="flex flex-wrap gap-2">
      <AddAssetStoreButton />
      <AddFolderButton />
    </div>
  </section>
);

export { FolderSetting };
