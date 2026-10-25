import type { ReactNode } from "react";

import { useAutostart, useSetAutostart } from "#/pages/settings/api/autostart";
import { Switch } from "#/shared/ui/switch";

const ID = "autostart";
const LABEL = "Windows へのサインイン時に起動する";
const HINT = "起動していないと Unity から検索できません。起動したときはトレイに入ります。";

const AutostartSetting = (): ReactNode => {
  const autostart = useAutostart();
  const { mutate, isPending } = useSetAutostart();
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <label htmlFor={ID} className="flex flex-col gap-1">
        <span className="text-sm font-medium">{LABEL}</span>
        <span className="text-muted-foreground text-xs">{HINT}</span>
      </label>
      <Switch
        id={ID}
        checked={autostart.data ?? false}
        disabled={!autostart.isSuccess || isPending}
        onCheckedChange={mutate}
      />
    </div>
  );
};

export { AutostartSetting };
