import type { ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

const Progress = ({
  className,
  value,
  max,
  label,
}: Readonly<{ className?: string; value: number; max: number; label: string }>): ReactNode => (
  <progress
    data-slot="progress"
    aria-label={label}
    value={value}
    max={max}
    className={cn(
      "h-2 w-full appearance-none overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-primary/20 [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:transition-all",
      className,
    )}
  />
);

export { Progress };
