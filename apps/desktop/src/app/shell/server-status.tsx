import type { ReactNode } from "react";

import { useStatus } from "#/shared/api";

import { IndexingProgress } from "./indexing-progress.tsx";
import { Unreachable } from "./unreachable.tsx";

const STARTING = "起動しています…";

const ServerStatus = (): ReactNode => {
  const status = useStatus();
  if (status.isPending) {
    return <p className="text-muted-foreground text-xs">{STARTING}</p>;
  }
  if (status.isError) {
    return <Unreachable />;
  }
  const { indexing, packages, images } = status.data;
  return indexing && <IndexingProgress packages={packages} images={images} />;
};

export { ServerStatus };
