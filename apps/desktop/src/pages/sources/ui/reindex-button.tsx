import { RefreshCw } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { useReindex } from "#/shared/api";

const LABEL = "変更を読み直す";

const ReindexButton = (): ReactNode => {
  const reindex = useReindex();
  const { mutate } = reindex;
  const onClick = useCallback(() => {
    mutate();
  }, [mutate]);
  return (
    <Button variant="outline" onClick={onClick} disabled={reindex.isPending}>
      <RefreshCw />
      {LABEL}
    </Button>
  );
};

export { ReindexButton };
