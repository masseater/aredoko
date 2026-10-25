import { useMutation } from "@tanstack/react-query";
import { openUrl } from "@tauri-apps/plugin-opener";
import { ExternalLink } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

const LABEL = "BOOTH の商品ページを開く";

const BoothOpenButton = ({ url }: Readonly<{ url: string }>): ReactNode => {
  const { mutate } = useMutation({ mutationFn: (target: string) => openUrl(target) });
  const onClick = useCallback(() => {
    mutate(url);
  }, [mutate, url]);
  return (
    <Button variant="outline" size="sm" className="self-start" onClick={onClick}>
      <ExternalLink />
      {LABEL}
    </Button>
  );
};

export { BoothOpenButton };
