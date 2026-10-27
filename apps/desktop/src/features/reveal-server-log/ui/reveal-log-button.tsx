import { useMutation } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { revealServerLog } from "#/features/reveal-server-log/api/server-log";

const LABEL = "サーバーのログを表示";

const RevealLogButton = (): ReactNode => {
  const { mutate } = useMutation({ mutationFn: revealServerLog });
  const onClick = useCallback(() => {
    mutate();
  }, [mutate]);
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <FileText />
      {LABEL}
    </Button>
  );
};

export { RevealLogButton };
