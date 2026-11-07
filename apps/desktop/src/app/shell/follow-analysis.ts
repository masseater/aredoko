import { useQueryClient } from "@tanstack/react-query";
import { Effect } from "effect";
import { useEffect } from "react";

import { ASSETS_KEY, useStatus } from "#/shared/api";

const useFollowAnalysis = (): void => {
  const client = useQueryClient();
  const status = useStatus();
  const analyzed = status.isSuccess && status.data.images.done;
  useEffect(() => {
    if (analyzed !== false) {
      Effect.runFork(Effect.promise(() => client.invalidateQueries({ queryKey: ASSETS_KEY })));
    }
  }, [analyzed, client]);
};

export { useFollowAnalysis };
