import type { ReactNode } from "react";

import { AddDownloadsButton } from "./add-downloads-button.tsx";
import { PickOtherFolderButton } from "./pick-other-folder-button.tsx";

const FirstFolder = (): ReactNode => (
  <div className="flex flex-1 flex-col items-center justify-center gap-3">
    <AddDownloadsButton />
    <PickOtherFolderButton />
  </div>
);

export { FirstFolder };
