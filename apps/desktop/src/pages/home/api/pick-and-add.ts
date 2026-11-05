import { useMutation } from "@tanstack/react-query";
import { Option } from "effect";
import { useCallback } from "react";

import { pickFolder } from "./pick-folder.ts";
import { useAddSource } from "./queries.ts";

const usePickAndAdd = (): Readonly<{ onClick: () => void; busy: boolean }> => {
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
  return { onClick, busy: pick.isPending || add.isPending };
};

export { usePickAndAdd };
