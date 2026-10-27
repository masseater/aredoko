import type { ReactNode } from "react";

const RUNNING = "動作中";

const Running = (): ReactNode => (
  <p className="flex items-center gap-2 text-xs">
    <span className="bg-primary size-2 rounded-full" />
    {RUNNING}
  </p>
);

export { Running };
