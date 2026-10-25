import { Array, Effect, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { kindOf, searchableText } from "#entities/package";
import { decodeRows } from "#shared/sql";

import { IdRow } from "./rows.ts";

interface AssetInput {
  readonly guid: string;
  readonly pathname: string;
  readonly previews: readonly Uint8Array[];
  readonly references: readonly string[];
}

interface OneAsset {
  readonly packageId: number;
  readonly packageName: string;
  readonly asset: AssetInput;
}

const insertAsset = Effect.fn("insertAsset")(function* insertOneAsset({
  packageId,
  packageName,
  asset: { guid, pathname, previews, references },
}: OneAsset) {
  const sql = yield* SqlClient.SqlClient;
  const kind = kindOf(pathname);
  const text = searchableText({ pathname, kind, packageName });
  yield* sql`delete from assets where package_id = ${packageId} and guid = ${guid}`;
  const rows = yield* decodeRows(IdRow)(
    sql`insert into assets(package_id, guid, pathname, kind, text)
      values (${packageId}, ${guid}, ${pathname}, ${kind}, ${text}) returning id`,
  );
  const { id } = yield* Effect.fromOption(Array.head(rows));
  yield* pipe(
    previews,
    Effect.forEach((png) => sql`insert into images(asset_id, png) values (${id}, ${png})`),
  );
  yield* pipe(
    references,
    Effect.forEach(
      (reference) =>
        sql`insert or ignore into asset_references(asset_id, guid) values (${id}, ${reference})`,
    ),
  );
});

/** @internal */
const insertAssets = Effect.fn("insertAssets")(function* insertAllAssets({
  packageId,
  packageName,
  assets,
}: {
  readonly packageId: number;
  readonly packageName: string;
  readonly assets: readonly AssetInput[];
}) {
  yield* pipe(
    assets,
    Effect.forEach((asset) => insertAsset({ packageId, packageName, asset })),
  );
});

export { insertAssets };
export type { AssetInput };
