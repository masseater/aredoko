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
      "bg-muted relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border group-hover:border-foreground/40",
      active && "border-primary ring-2 ring-primary",
    )}
  >
    <ResultPreview result={result} />
    {result.analyzing && (
      <span
        aria-hidden
        className="from-primary/0 via-primary/35 to-primary/0 motion-safe:animate-scan pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b"
      />
    )}
  </span>
);

export { TileThumbnail };
