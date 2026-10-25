import type { ReactNode } from "react";

const DEVICE_LABELS: Readonly<Record<string, string>> = { dml: "GPU", cpu: "CPU" };

const Running = ({ device }: Readonly<{ device: string }>): ReactNode => (
  <p className="flex items-center gap-2 text-xs">
    <span className="bg-primary size-2 rounded-full" />
    {`${DEVICE_LABELS[device] ?? device} で動作中`}
  </p>
);

export { Running };
