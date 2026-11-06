import { FilePlus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { usePickAndImport } from "#/features/library/api/pick-and-import";

const LABEL = "ファイルを取り込む";

const PickFilesButton = ({
  size = "default",
  variant = "default",
}: Readonly<{ size?: "default" | "lg"; variant?: "default" | "outline" }>): ReactNode => {
  const { onClick, busy } = usePickAndImport();
  return (
    <Button size={size} variant={variant} onClick={onClick} disabled={busy}>
      <FilePlus />
      {LABEL}
    </Button>
  );
};

export { PickFilesButton };
