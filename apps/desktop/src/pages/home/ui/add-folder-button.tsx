import { FolderPlus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { usePickAndAdd } from "#/pages/home/api/pick-and-add";

const LABEL = "フォルダを追加";

const AddFolderButton = (): ReactNode => {
  const { onClick, busy } = usePickAndAdd();
  return (
    <Button className="self-start" onClick={onClick} disabled={busy}>
      <FolderPlus />
      {LABEL}
    </Button>
  );
};

export { AddFolderButton };
