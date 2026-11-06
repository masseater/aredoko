import { Option, pipe } from "effect";
import { Library, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { useAddSource, useKnownFolder } from "#/features/library/api/queries";
import type { KnownFolder } from "#/features/library/api/queries";

interface Labelled {
  readonly label: string;
  readonly Icon: LucideIcon;
}

const LABELS: Readonly<Record<KnownFolder, Labelled>> = {
  assetStore: { label: "Unity Asset Store を追加", Icon: Store },
  blm: { label: "BOOTH Library Manager を追加", Icon: Library },
};

const AddKnownFolderButton = ({
  folder,
  size = "default",
}: Readonly<{ folder: KnownFolder; size?: "default" | "lg" }>): ReactNode => {
  const location = useKnownFolder(folder);
  const add = useAddSource();
  const { mutate } = add;
  const onClick = useCallback(() => {
    pipe(
      location,
      Option.map((path) => {
        mutate({ path, kind: "folder" });
        return path;
      }),
    );
  }, [mutate, location]);
  if (Option.isNone(location)) {
    return false;
  }
  const { label, Icon } = LABELS[folder];
  return (
    <Button variant="outline" size={size} onClick={onClick} disabled={add.isPending}>
      <Icon />
      {label}
    </Button>
  );
};

export { AddKnownFolderButton };
