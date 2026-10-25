import type { ReactNode } from "react";

import type { Counter } from "./counter.ts";
import { ProgressStep } from "./progress-step.tsx";

const PACKAGES = "パッケージ";
const IMAGES = "画像";

const IndexingProgress = ({
  current,
  packages,
  images,
}: Readonly<{ current: string | null; packages: Counter; images: Counter }>): ReactNode => (
  <div className="flex flex-col gap-2 text-xs">
    <ProgressStep label={PACKAGES} counter={packages} />
    <ProgressStep label={IMAGES} counter={images} />
    {current !== null && <p className="text-muted-foreground truncate">{current}</p>}
  </div>
);

export { IndexingProgress };
