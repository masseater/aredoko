import type { Package } from "protocol";
import type { ReactNode } from "react";

import { BoothOpenButton } from "./booth-open-button.tsx";
import { RevealButton } from "./reveal-button.tsx";

const PackageLinks = ({ item }: Readonly<{ item: typeof Package.Type }>): ReactNode => (
  <>
    <RevealButton path={item.path} />
    {item.booth !== null && <BoothOpenButton url={item.booth.url} />}
  </>
);

export { PackageLinks };
