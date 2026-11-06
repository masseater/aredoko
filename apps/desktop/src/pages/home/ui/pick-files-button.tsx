import { FilePlus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { usePickAndImport } from "#/pages/home/api/pick-and-import";

const LABEL = "ファイルを選ぶ";

const PickFilesButton = ({
  size = "default",
}: Readonly<{ size?: "default" | "lg" }>): ReactNode => {
  const { onClick, busy } = usePickAndImport();
  return (
    <Button size={size} onClick={onClick} disabled={busy}>
      <FilePlus />
      {LABEL}
    </Button>
  );
};

export { PickFilesButton };
