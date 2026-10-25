import { useMutation } from "@tanstack/react-query";
import { Option } from "effect";
import { FolderPlus } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { pickFolder } from "#/features/add-folder/api/pick-folder";
import { useAddSource } from "#/shared/api";

const LABEL = "フォルダを追加";

const AddFolderButton = (): ReactNode => {
  const add = useAddSource();
  const { mutate: addFolder } = add;
  const pick = useMutation({
    mutationFn: pickFolder,
    onSuccess: (picked) => {
      if (Option.isSome(picked)) {
        addFolder({ path: picked.value, kind: "folder" });
      }
    },
  });
  const { mutate: pickAndAdd } = pick;
  const onClick = useCallback(() => {
    pickAndAdd();
  }, [pickAndAdd]);
  return (
    <Button onClick={onClick} disabled={pick.isPending || add.isPending}>
      <FolderPlus />
      {LABEL}
    </Button>
  );
};

export { AddFolderButton };
