import type { Package } from "protocol";
import type { ReactNode } from "react";

import { RevealButton } from "./reveal-button.tsx";

const PackageHeader = ({ item }: Readonly<{ item: typeof Package.Type }>): ReactNode => (
  <header className="flex flex-col gap-2">
    <h3 className="text-lg font-semibold break-all">{item.name}</h3>
    <p className="text-muted-foreground text-xs break-all">{item.path}</p>
    <RevealButton path={item.path} />
  </header>
);

export { PackageHeader };
