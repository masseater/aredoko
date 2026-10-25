import type { ReactNode } from "react";

const UNREACHABLE = "サーバーに接続できません";
const UNREACHABLE_HINT = "設定からログを開いて原因を確かめられます。";

const Unreachable = (): ReactNode => (
  <div className="flex flex-col gap-1 text-xs">
    <p className="text-destructive font-medium">{UNREACHABLE}</p>
    <p className="text-muted-foreground">{UNREACHABLE_HINT}</p>
  </div>
);

export { Unreachable };
