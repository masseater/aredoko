import { useMutation } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { revealServerLog } from "#/pages/settings/api/server-log";

const TITLE = "サーバーのログ";
const HINT = "うまく動かないときは、このファイルを添えて報告してください。";
const OPEN = "ログを表示";

const LogSetting = (): ReactNode => {
  const { mutate } = useMutation({ mutationFn: revealServerLog });
  const onClick = useCallback(() => {
    mutate();
  }, [mutate]);
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{TITLE}</p>
        <p className="text-muted-foreground text-xs">{HINT}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onClick}>
        <FileText />
        {OPEN}
      </Button>
    </div>
  );
};

export { LogSetting };
