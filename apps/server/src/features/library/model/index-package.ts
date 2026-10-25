import { Array, Effect, Option, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { summarize } from "#entities/package";
import { readPackage } from "#shared/unitypackage";
import type { PackageEntry } from "#shared/unitypackage";

import { embedTexts } from "./embed-texts.ts";
import { insertAssets } from "./insert-assets.ts";
import type { AssetInput } from "./insert-assets.ts";
import { encodeJson } from "./json.ts";
import { labelOf, nameOf } from "./name.ts";
import { boothOf, insertPackage } from "./package-row.ts";
import type { PackageFile } from "./package-row.ts";

const assetOf = ({ guid, pathname, preview, references }: PackageEntry): AssetInput => ({
  guid,
  pathname,
  previews: Option.toArray(preview),
  references,
});

/** @internal */
const indexPackage = Effect.fn("indexPackage")(function* indexPackageFile(file: PackageFile) {
  const sql = yield* SqlClient.SqlClient;
  const entries = yield* readPackage(file.path);
  const name = nameOf(file.path);
  const summary = yield* encodeJson(summarize({ name, entries }));
  const booth = yield* boothOf(file.path);
  const assets = pipe(entries, Array.map(assetOf));
  const packageName = labelOf({ name, booth });
  const packageId = yield* sql.withTransaction(
    Effect.gen(function* write() {
      const id = yield* insertPackage({ file, name, summary, booth });
      yield* insertAssets({ packageId: id, packageName, assets });
      return id;
    }),
  );
  yield* embedTexts(packageId);
});

export { indexPackage };
