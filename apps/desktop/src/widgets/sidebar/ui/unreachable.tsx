import type { ReactNode } from "react";

import { RevealLogButton } from "#/features/reveal-server-log";

const UNREACHABLE = "サーバーに接続できません";

const Unreachable = (): ReactNode => (
  <div className="flex flex-col items-start gap-2 text-xs">
    <p className="text-destructive font-medium">{UNREACHABLE}</p>
    <RevealLogButton />
  </div>
);

export { Unreachable };
