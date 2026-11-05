import { FolderPlus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { usePickAndAdd } from "#/pages/home/api/pick-and-add";

const PICK_OTHER = "別のフォルダを選ぶ";

const PickOtherFolderButton = (): ReactNode => {
  const { onClick, busy } = usePickAndAdd();
  return (
    <Button variant="outline" size="lg" onClick={onClick} disabled={busy}>
      <FolderPlus />
      {PICK_OTHER}
    </Button>
  );
};

export { PickOtherFolderButton };
