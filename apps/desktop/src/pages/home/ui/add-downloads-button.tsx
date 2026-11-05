import { useMutation } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { downloadsFolder } from "#/pages/home/api/downloads-folder";
import { useAddSource } from "#/pages/home/api/queries";

const LABEL = "ダウンロード フォルダを追加";

const AddDownloadsButton = (): ReactNode => {
  const add = useAddSource();
  const { mutate: addFolder } = add;
  const locate = useMutation({
    mutationFn: downloadsFolder,
    onSuccess: (path) => {
      addFolder({ path, kind: "folder" });
    },
  });
  const { mutate: addDownloads } = locate;
  const onClick = useCallback(() => {
    addDownloads();
  }, [addDownloads]);
  const failure = locate.error ?? add.error;
  return (
    <>
      <Button size="lg" onClick={onClick} disabled={locate.isPending || add.isPending}>
        <Download />
        {LABEL}
      </Button>
      {failure !== null && <p className="text-destructive text-xs">{failure.message}</p>}
    </>
  );
};

export { AddDownloadsButton };
