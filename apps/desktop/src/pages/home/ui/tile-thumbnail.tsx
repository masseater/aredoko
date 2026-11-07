import type { SearchResult } from "protocol";
import type { ReactNode } from "react";
import { cn } from "ui/cn";

import { useStatus } from "#/shared/api";

import { ResultPreview } from "./result-preview.tsx";

const useAnalyzingNow = (assetId: number): boolean => {
  const status = useStatus();
  return status.isSuccess && status.data.analyzingAssetId === assetId;
};

const TileThumbnail = ({
  result,
  active,
}: Readonly<{ result: typeof SearchResult.Type; active: boolean }>): ReactNode => {
  const now = useAnalyzingNow(result.assetId);
  return (
    <span
      className={cn(
        "bg-muted relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border group-hover:border-foreground/40",
        active && "border-primary ring-2 ring-primary",
      )}
    >
      <span
        className={cn(
          "flex size-full items-center justify-center transition-all duration-700",
          result.analyzing && !now && "opacity-40 grayscale",
        )}
      >
        <ResultPreview result={result} />
      </span>
      {now && (
        <span
          aria-hidden
          className="from-primary/0 via-primary/50 to-primary/0 motion-safe:animate-scan pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b"
        />
      )}
    </span>
  );
};

export { TileThumbnail };
