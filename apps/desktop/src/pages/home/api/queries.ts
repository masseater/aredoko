import {
  queryOptions,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { Array, Option, String, pipe } from "effect";
import type { AssetKind, Package, SearchResult, Source, SourceKind } from "protocol";

import { NO_IMPORT, lastImportOf } from "#/pages/home/model";
import type { LastImport } from "#/pages/home/model";
import {
  STATUS_KEY,
  addSource,
  getLibrary,
  getPreview,
  importFiles,
  linkBooth,
  listPackages,
  listSources,
  removeSource,
  search,
} from "#/shared/api";

const LIBRARY_INTERVAL = 5000;
const SEARCH_LIMIT = 120;

const SOURCES_KEY = ["sources"];
const LIBRARY_KEY = ["library"];
const IMPORT_KEY = ["import"];
const PACKAGES_KEY = ["packages"];

const useSources = (): UseQueryResult<readonly (typeof Source.Type)[]> =>
  useQuery(
    queryOptions({
      queryKey: SOURCES_KEY,
      queryFn: listSources,
      refetchInterval: LIBRARY_INTERVAL,
      retry: false,
    }),
  );

const usePackages = (): UseQueryResult<readonly (typeof Package.Type)[]> =>
  useQuery(
    queryOptions({
      queryKey: PACKAGES_KEY,
      queryFn: listPackages,
      refetchInterval: LIBRARY_INTERVAL,
      retry: false,
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

const useLibrary = (): UseQueryResult<
  Readonly<{ path: string; assetStore: Option.Option<string> }>
> => useQuery(queryOptions({ queryKey: LIBRARY_KEY, queryFn: getLibrary, retry: false }));

interface NamedFolder {
  readonly name: string;
  readonly removable: boolean;
}

const LIBRARY: NamedFolder = { name: "aredoko", removable: false };

const ASSET_STORE: NamedFolder = { name: "Unity Asset Store", removable: true };

const NOT_NAMED = (): Option.Option<NamedFolder> => Option.none();

const useFolderName = (): ((path: string) => Option.Option<NamedFolder>) => {
  const library = useLibrary();
  if (!library.isSuccess) {
    return NOT_NAMED;
  }
  const { path: libraryPath, assetStore } = library.data;
  return (path) => {
    if (path === libraryPath) {
      return Option.some(LIBRARY);
    }
    if (Option.contains(assetStore, path)) {
      return Option.some(ASSET_STORE);
    }
    return Option.none();
  };
};

const useAssetStore = (): Option.Option<string> => {
  const library = useLibrary();
  const sources = useSources();
  if (!library.isSuccess || !sources.isSuccess) {
    return Option.none();
  }
  const registered = sources.data;
  return pipe(
    library.data.assetStore,
    Option.filter(
      (folder) =>
        !pipe(
          registered,
          Array.some(({ path }) => path === folder),
        ),
    ),
  );
};

const useImportFiles = (): UseMutationResult<number, Error, readonly string[]> => {
  const refresh = useRefreshLibrary();
  return useMutation({ mutationKey: IMPORT_KEY, mutationFn: importFiles, onSuccess: refresh });
};

const useLastImport = (): LastImport =>
  pipe(
    useMutationState({
      filters: { mutationKey: IMPORT_KEY },
      select: ({ state: { status, data, error } }) => lastImportOf({ status, data, error }),
    }),
    Array.last,
    Option.getOrElse(() => NO_IMPORT),
  );

const useLinkBooth = (): UseMutationResult<
  typeof Package.Type,
  Error,
  Readonly<{ packageId: number; url: string }>
> => {
  const refresh = useRefreshLibrary();
  return useMutation({ mutationFn: linkBooth, onSuccess: refresh });
};

export type { NamedFolder };
export {
  useAddSource,
  useImportFiles,
  useAssetStore,
  useLastImport,
  useFolderName,
  useLinkBooth,
  usePackages,
  usePreview,
  useRemoveSource,
  useSearch,
  useSources,
};
