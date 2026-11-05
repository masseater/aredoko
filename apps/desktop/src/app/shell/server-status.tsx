import type { ReactNode } from "react";

import { useStatus } from "#/shared/api";

import { IndexingProgress } from "./indexing-progress.tsx";
import { Unreachable } from "./unreachable.tsx";

const STARTING = "サーバーを起動しています…";

const ServerStatus = (): ReactNode => {
  const status = useStatus();
  if (status.isPending) {
    return <p className="text-muted-foreground text-xs">{STARTING}</p>;
  }
  if (status.isError) {
    return <Unreachable />;
  }
  const { indexing, current, packages, images } = status.data;
  return indexing && <IndexingProgress current={current} packages={packages} images={images} />;
};

export { ServerStatus };
