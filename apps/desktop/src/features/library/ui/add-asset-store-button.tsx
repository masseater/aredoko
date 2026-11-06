import { Option, pipe } from "effect";
import { Store } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { useAddSource, useAssetStore } from "#/features/library/api/queries";

const LABEL = "Unity Asset Store を追加";

const AddAssetStoreButton = ({
  size = "default",
}: Readonly<{ size?: "default" | "lg" }>): ReactNode => {
  const assetStore = useAssetStore();
  const add = useAddSource();
  const { mutate } = add;
  const onClick = useCallback(() => {
    pipe(
      assetStore,
      Option.map((path) => {
        mutate({ path, kind: "folder" });
        return path;
      }),
    );
  }, [mutate, assetStore]);
  if (Option.isNone(assetStore)) {
    return false;
  }
  return (
    <Button variant="outline" size={size} onClick={onClick} disabled={add.isPending}>
      <Store />
      {LABEL}
    </Button>
  );
};

export { AddAssetStoreButton };
