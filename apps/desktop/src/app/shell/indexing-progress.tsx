import type { ReactNode } from "react";

import { fileNameOf } from "#/shared/lib";

import { ProgressStep } from "./progress-step.tsx";
import type { Counter } from "./progress-step.tsx";

const IMPORTING = "取り込み中";

const stepOf = (packages: Counter, images: Counter): Counter => {
  if (packages.done < packages.total) {
    return packages;
  }
  return images;
};

const IndexingProgress = ({
  current,
  packages,
  images,
}: Readonly<{ current: string | null; packages: Counter; images: Counter }>): ReactNode => (
  <div className="flex items-center gap-4 text-xs">
    <ProgressStep label={IMPORTING} counter={stepOf(packages, images)} />
    {current !== null && (
      <p className="text-muted-foreground max-w-48 truncate">{fileNameOf(current)}</p>
    )}
  </div>
);

export { IndexingProgress };
