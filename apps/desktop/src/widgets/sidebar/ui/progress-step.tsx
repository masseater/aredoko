import type { ReactNode } from "react";

import { Progress } from "#/shared/ui/progress";

import type { Counter } from "./counter.ts";

const ProgressStep = ({
  label,
  counter,
}: Readonly<{ label: string; counter: Counter }>): ReactNode => (
  <div className="flex flex-col gap-1">
    <p className="text-muted-foreground">{`${label} ${counter.done.toString()} / ${counter.total.toString()}`}</p>
    <Progress label={label} value={counter.done} max={counter.total} />
  </div>
);

export { ProgressStep };
