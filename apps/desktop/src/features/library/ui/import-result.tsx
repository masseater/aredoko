import { CircleAlert, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

import { useLastImport } from "#/features/library/api/queries";

const NOTHING = "取り込めるアセットがありませんでした";
const NONE_PLACED = 0;

const ImportResult = (): ReactNode => {
  const last = useLastImport();
  if (last.status === "failed") {
    return (
      <p className="text-destructive flex items-center gap-1.5 text-xs">
        <CircleAlert className="size-3.5" />
        {last.message}
      </p>
    );
  }
  if (last.status !== "placed") {
    return false;
  }
  if (last.packages === NONE_PLACED) {
    return (
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <CircleAlert className="size-3.5" />
        {NOTHING}
      </p>
    );
  }
  return (
    <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <CircleCheck className="size-3.5" />
      {`${last.packages.toString()} 個を取り込みました`}
    </p>
  );
};

export { ImportResult };
