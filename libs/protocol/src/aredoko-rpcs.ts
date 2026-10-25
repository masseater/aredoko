import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";

import {
  AssetKind,
  Id,
  Package,
  ProjectAsset,
  SearchResult,
  Source,
  SourceKind,
  Status,
} from "./models.ts";
import { RequestFailed } from "./request-failed.ts";

const MAX_RESULTS = 200;

const Sources = Schema.Struct({ sources: Schema.Array(Source) });

const Packages = Schema.Struct({ packages: Schema.Array(Package) });

const SearchQuery = {
  query: Schema.String,
  limit: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: MAX_RESULTS })),
  kinds: Schema.Array(AssetKind),
};

const SearchResults = Schema.Struct({ results: Schema.Array(SearchResult) });

const Preview = Schema.Struct({ png: Schema.Uint8ArrayFromBase64 });

const Extracted = Schema.Struct({
  path: Schema.String,
  assets: Schema.Int,
  missing: Schema.Array(Schema.String),
});

const ProjectAssets = {
  projectPath: Schema.String,
  assets: Schema.Array(ProjectAsset),
  complete: Schema.Boolean,
};

/** @internal */
export class AredokoRpcs extends RpcGroup.make(
  Rpc.make("GetStatus", { success: Status, error: RequestFailed }),
  Rpc.make("ListSources", { success: Sources, error: RequestFailed }),
  Rpc.make("AddSource", {
    payload: { path: Schema.String, kind: SourceKind },
    success: Source,
    error: RequestFailed,
  }),
  Rpc.make("RemoveSource", { payload: { id: Id }, error: RequestFailed }),
  Rpc.make("Reindex", { error: RequestFailed }),
  Rpc.make("ListPackages", { success: Packages, error: RequestFailed }),
  Rpc.make("GetPackage", { payload: { id: Id }, success: Package, error: RequestFailed }),
  Rpc.make("Search", { payload: SearchQuery, success: SearchResults, error: RequestFailed }),
  Rpc.make("GetPreview", { payload: { assetId: Id }, success: Preview, error: RequestFailed }),
  Rpc.make("Extract", {
    payload: { assetIds: Schema.Array(Id) },
    success: Extracted,
    error: RequestFailed,
  }),
  Rpc.make("LinkBooth", {
    payload: { packageId: Id, url: Schema.String },
    success: Package,
    error: RequestFailed,
  }),
  Rpc.make("PutProjectAssets", { payload: ProjectAssets, error: RequestFailed }),
) {}
