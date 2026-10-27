import { Trash2 } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { useRemoveSource } from "#/pages/home/api/queries";

const LABEL = "登録を外す";

const RemoveSourceButton = ({ id }: Readonly<{ id: number }>): ReactNode => {
  const remove = useRemoveSource();
  const { mutate } = remove;
  const onClick = useCallback(() => {
    mutate(id);
  }, [mutate, id]);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={LABEL}
      title={LABEL}
      onClick={onClick}
      disabled={remove.isPending}
    >
      <Trash2 />
    </Button>
  );
};

export { RemoveSourceButton };
