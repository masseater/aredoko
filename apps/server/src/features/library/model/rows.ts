import { Schema } from "effect";

const IdRow = Schema.Struct({ id: Schema.Int });

const PackageFileRow = Schema.Struct({
  id: Schema.Int,
  path: Schema.String,
  size: Schema.Int,
  modified_at: Schema.Int,
});

const AssetTextRow = Schema.Struct({ id: Schema.Int, text: Schema.String });

const ImageRow = Schema.Struct({ id: Schema.Int, png: Schema.Uint8Array });

const SourcePathRow = Schema.Struct({ id: Schema.Int, path: Schema.String });

const AssetGuidRow = Schema.Struct({
  id: Schema.Int,
  guid: Schema.String,
  pathname: Schema.String,
});

export { AssetGuidRow, AssetTextRow, IdRow, ImageRow, PackageFileRow, SourcePathRow };
