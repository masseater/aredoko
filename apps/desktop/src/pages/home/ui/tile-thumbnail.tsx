import type { SearchResult } from "protocol";
import type { ReactNode } from "react";
import { cn } from "ui/cn";

import { ResultPreview } from "./result-preview.tsx";

const TileThumbnail = ({
  result,
  active,
}: Readonly<{ result: typeof SearchResult.Type; active: boolean }>): ReactNode => (
  <span
    className={cn(
      "bg-muted flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border group-hover:border-foreground/40",
      active && "border-primary ring-2 ring-primary",
    )}
  >
    <ResultPreview result={result} />
  </span>
);

export { TileThumbnail };
