import { useMutation } from "@tanstack/react-query";
import { openPath } from "@tauri-apps/plugin-opener";
import { ExternalLink } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

const LABEL = "ファイルを開く";

const OpenFileButton = ({ path }: Readonly<{ path: string }>): ReactNode => {
  const { mutate, error } = useMutation({ mutationFn: (file: string) => openPath(file) });
  const onClick = useCallback(() => {
    mutate(path);
  }, [mutate, path]);
  return (
    <>
      <Button variant="outline" size="sm" className="self-start" onClick={onClick}>
        <ExternalLink />
        {LABEL}
      </Button>
      {error !== null && <p className="text-destructive text-xs">{error.message}</p>}
    </>
  );
};

export { OpenFileButton };
