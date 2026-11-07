import { Cpu } from "lucide-react";
import type { ReactNode } from "react";

import { fileNameOf } from "#/shared/lib";

import { ProgressStep } from "./progress-step.tsx";
import type { Counter } from "./progress-step.tsx";

const IMPORTING = "取り込み中";
const ANALYZING = "この PC で解析中";

interface Step {
  readonly label: string;
  readonly counter: Counter;
  readonly analyzing: boolean;
}

const stepOf = (packages: Counter, images: Counter): Step => {
  if (packages.done < packages.total) {
    return { label: IMPORTING, counter: packages, analyzing: false };
  }
  return { label: ANALYZING, counter: images, analyzing: true };
};

const IndexingProgress = ({
  current,
  packages,
  images,
}: Readonly<{ current: string | null; packages: Counter; images: Counter }>): ReactNode => {
  const step = stepOf(packages, images);
  return (
    <div className="flex items-center gap-4 text-xs">
      {step.analyzing && <Cpu aria-hidden className="text-muted-foreground size-4" />}
      <ProgressStep label={step.label} counter={step.counter} />
      {current !== null && (
        <p className="text-muted-foreground max-w-48 truncate">{fileNameOf(current)}</p>
      )}
    </div>
  );
};

export { IndexingProgress };
