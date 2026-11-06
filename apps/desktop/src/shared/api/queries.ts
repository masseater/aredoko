import { queryOptions, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Status } from "protocol";

import { getStatus } from "./aredoko.ts";

const STATUS_INTERVAL = 2000;

const STATUS_KEY = ["status"];

const SOURCES_KEY = ["sources"];

const PACKAGES_KEY = ["packages"];

const ASSETS_KEY = ["assets"];

const useStatus = (): UseQueryResult<typeof Status.Type> =>
  useQuery(
    queryOptions({
      queryKey: STATUS_KEY,
      queryFn: getStatus,
      refetchInterval: STATUS_INTERVAL,
      retry: false,
    }),
  );

export { ASSETS_KEY, PACKAGES_KEY, SOURCES_KEY, STATUS_KEY, useStatus };
