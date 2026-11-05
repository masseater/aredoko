import type { ReactNode } from "react";

import { Progress } from "#/shared/ui/progress";

type Counter = Readonly<{ done: number; total: number }>;

const NOTHING_COUNTED = 0;

const textOf = (label: string, { done, total }: Counter): string => {
  if (total === NOTHING_COUNTED) {
    return label;
  }
  return `${label} ${done.toString()} / ${total.toString()}`;
};

const ProgressStep = ({
  label,
  counter,
}: Readonly<{ label: string; counter: Counter }>): ReactNode => (
  <div className="flex w-32 flex-col gap-1">
    <p className="text-muted-foreground">{textOf(label, counter)}</p>
    <Progress label={label} value={counter.done} max={counter.total} />
  </div>
);

export type { Counter };
export { ProgressStep };
