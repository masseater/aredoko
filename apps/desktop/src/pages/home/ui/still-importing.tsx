import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

import { useStatus } from "#/shared/api";

const StillImporting = (): ReactNode => {
  const status = useStatus();
  if (!status.isSuccess || !status.data.indexing) {
    return false;
  }
  const { done, total } = status.data.images;
  return (
    <p className="text-muted-foreground flex items-center gap-2 text-sm">
      <LoaderCircle className="animate-spin" />
      {`${done.toString()} / ${total.toString()}`}
    </p>
  );
};

export { StillImporting };
