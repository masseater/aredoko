import { PackagePlus } from "lucide-react";
import type { ReactNode } from "react";

import { AddAssetStoreButton } from "./add-asset-store-button.tsx";
import { AddFolderButton } from "./add-folder-button.tsx";
import { ImportResult } from "./import-result.tsx";
import { PickFilesButton } from "./pick-files-button.tsx";

const DROP_HERE = "ここにドロップ";

const FirstImport = (): ReactNode => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4">
    <div className="text-muted-foreground flex flex-col items-center gap-2">
      <PackagePlus className="size-12" />
      <p className="text-sm">{DROP_HERE}</p>
    </div>
    <div className="flex flex-col items-stretch gap-2">
      <PickFilesButton size="lg" />
      <AddAssetStoreButton size="lg" />
      <AddFolderButton size="lg" />
    </div>
    <ImportResult />
  </div>
);

export { FirstImport };
