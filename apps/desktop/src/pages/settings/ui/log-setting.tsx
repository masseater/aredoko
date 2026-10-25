import type { ReactNode } from "react";

import { RevealLogButton } from "#/features/reveal-server-log";

const TITLE = "サーバーのログ";

const LogSetting = (): ReactNode => (
  <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
    <p className="text-sm font-medium">{TITLE}</p>
    <RevealLogButton />
  </div>
);

export { LogSetting };
