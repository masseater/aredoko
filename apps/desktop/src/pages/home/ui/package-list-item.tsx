import { Option } from "effect";
import type { Package } from "protocol";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { cn } from "ui/cn";

import { useSelectPackage, useSelectedPackage } from "#/pages/home/model";

const PackageListItem = ({ item }: Readonly<{ item: typeof Package.Type }>): ReactNode => {
  const selected = useSelectedPackage();
  const select = useSelectPackage();
  const onClick = useCallback(() => {
    select(Option.some(item.id));
  }, [select, item.id]);
  const active = Option.contains(selected, item.id);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-accent",
        active && "bg-accent",
      )}
    >
      <span className="w-full truncate text-sm font-medium">{item.name}</span>
      <span className="text-muted-foreground text-xs">{`${item.assets.toString()} 個のアセット`}</span>
    </button>
  );
};

export { PackageListItem };
