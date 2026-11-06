import { useMutation } from "@tanstack/react-query";
import { Array } from "effect";
import { useCallback } from "react";

import { pickFiles } from "./pick-files.ts";
import { useImportFiles } from "./queries.ts";

const usePickAndImport = (): Readonly<{ onClick: () => void; busy: boolean }> => {
  const intake = useImportFiles();
  const { mutate: importFiles } = intake;
  const pick = useMutation({
    mutationFn: pickFiles,
    onSuccess: (paths) => {
      if (Array.isReadonlyArrayNonEmpty(paths)) {
        importFiles(paths);
      }
    },
  });
  const { mutate: pickAndImport } = pick;
  const onClick = useCallback(() => {
    pickAndImport();
  }, [pickAndImport]);
  return { onClick, busy: pick.isPending || intake.isPending };
};

export { usePickAndImport };
