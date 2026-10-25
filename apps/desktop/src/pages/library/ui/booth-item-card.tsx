import type { BoothItem } from "protocol";
import type { ReactNode } from "react";

import { BoothOpenButton } from "./booth-open-button.tsx";

const BoothItemCard = ({ item }: Readonly<{ item: typeof BoothItem.Type }>): ReactNode => (
  <div className="flex flex-col gap-2 rounded-lg border p-4">
    <p className="text-sm font-medium">{item.name}</p>
    <p className="text-muted-foreground text-xs">{`${item.shop}・${item.price}`}</p>
    <BoothOpenButton url={item.url} />
  </div>
);

export { BoothItemCard };
