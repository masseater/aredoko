import { FolderPlus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { usePickAndAdd } from "#/features/library/api/pick-and-add";

const LABEL = "フォルダを登録";

const AddFolderButton = ({
  size = "default",
}: Readonly<{ size?: "default" | "lg" }>): ReactNode => {
  const { onClick, busy } = usePickAndAdd();
  return (
    <Button variant="outline" size={size} onClick={onClick} disabled={busy}>
      <FolderPlus />
      {LABEL}
    </Button>
  );
};

export { AddFolderButton };
