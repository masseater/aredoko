import { useMutation } from "@tanstack/react-query";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { FolderSearch } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";

import { Button } from "#/shared/ui/button";

const LABEL = "フォルダで表示";

const RevealButton = ({ path }: Readonly<{ path: string }>): ReactNode => {
  const { mutate } = useMutation({ mutationFn: revealItemInDir });
  const onClick = useCallback(() => {
    mutate(path);
  }, [mutate, path]);
  return (
    <Button variant="outline" size="sm" className="self-start" onClick={onClick}>
      <FolderSearch />
      {LABEL}
    </Button>
  );
};

export { RevealButton };
