import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { String } from "effect";
import type { AssetKind, Package, SearchResult, Source, SourceKind, Status } from "protocol";

import {
  addSource,
  getPreview,
  getStatus,
  linkBooth,
  listPackages,
  listSources,
  reindex,
  removeSource,
  search,
} from "./aredoko.ts";

const STATUS_INTERVAL = 2000;
const LIBRARY_INTERVAL = 5000;
const SEARCH_LIMIT = 120;

const STATUS_KEY = ["status"];
const SOURCES_KEY = ["sources"];
const PACKAGES_KEY = ["packages"];

const useStatus = (): UseQueryResult<typeof Status.Type> =>
  useQuery(
    queryOptions({
      queryKey: STATUS_KEY,
      queryFn: getStatus,
      refetchInterval: STATUS_INTERVAL,
      retry: false,
    }),
  );

const useSources = (): UseQueryResult<readonly (typeof Source.Type)[]> =>
  useQuery(
    queryOptions({
      queryKey: SOURCES_KEY,
      queryFn: listSources,
      refetchInterval: LIBRARY_INTERVAL,
    }),
  );

const usePackages = (): UseQueryResult<readonly (typeof Package.Type)[]> =>
  useQuery(
    queryOptions({
      queryKey: PACKAGES_KEY,
      queryFn: listPackages,
      refetchInterval: LIBRARY_INTERVAL,
    }),
  );

const useSearch = ({
  query,
  kinds,
}: Readonly<{
  query: string;
  kinds: readonly (typeof AssetKind.Type)[];
}>): UseQueryResult<readonly (typeof SearchResult.Type)[]> => {
  const enabled = String.isNonEmpty(String.trim(query));
  return useQuery(
    queryOptions({
      queryKey: ["search", query, kinds],
      queryFn: () => search({ query, kinds, limit: SEARCH_LIMIT }),
      enabled,
    }),
  );
};

const usePreview = (assetId: number): UseQueryResult<string> =>
  useQuery(
    queryOptions({
      queryKey: ["preview", assetId],
      queryFn: () => getPreview(assetId),
      staleTime: Number.POSITIVE_INFINITY,
    }),
  );

const useRefreshLibrary = (): (() => Promise<unknown>) => {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: SOURCES_KEY }),
      client.invalidateQueries({ queryKey: PACKAGES_KEY }),
      client.invalidateQueries({ queryKey: STATUS_KEY }),
    ]);
};

const useAddSource = (): UseMutationResult<
  typeof Source.Type,
  Error,
  Readonly<{ path: string; kind: typeof SourceKind.Type }>
> => {
  const refresh = useRefreshLibrary();
  return useMutation({ mutationFn: addSource, onSuccess: refresh });
};

const useRemoveSource = (): UseMutationResult<void, Error, number> => {
  const refresh = useRefreshLibrary();
  return useMutation({ mutationFn: removeSource, onSuccess: refresh });
};

const useReindex = (): UseMutationResult<void, Error, void> => {
  const refresh = useRefreshLibrary();
  return useMutation({ mutationFn: reindex, onSuccess: refresh });
};

const useLinkBooth = (): UseMutationResult<
  typeof Package.Type,
  Error,
  Readonly<{ packageId: number; url: string }>
> => {
  const refresh = useRefreshLibrary();
  return useMutation({ mutationFn: linkBooth, onSuccess: refresh });
};

export {
  useAddSource,
  useLinkBooth,
  usePackages,
  usePreview,
  useReindex,
  useRemoveSource,
  useSearch,
  useSources,
  useStatus,
};
