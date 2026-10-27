import { queryOptions, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Status } from "protocol";

import { getStatus } from "./aredoko.ts";

const STATUS_INTERVAL = 2000;

const STATUS_KEY = ["status"];

const useStatus = (): UseQueryResult<typeof Status.Type> =>
  useQuery(
    queryOptions({
      queryKey: STATUS_KEY,
      queryFn: getStatus,
      refetchInterval: STATUS_INTERVAL,
      retry: false,
    }),
  );

export { STATUS_KEY, useStatus };
