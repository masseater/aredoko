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
  <div className="flex items-center gap-4 text-xs">
    <ProgressStep label={PACKAGES} counter={packages} />
    <ProgressStep label={IMAGES} counter={images} />
    {current !== null && <p className="text-muted-foreground max-w-48 truncate">{current}</p>}
  </div>
);

export { IndexingProgress };
