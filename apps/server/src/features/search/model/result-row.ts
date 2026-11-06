import { Array, Effect, HashMap, Option, Schema, pipe } from "effect";
import { SqlClient } from "effect/sql";
import { AssetKind, PackageKind } from "protocol";
import type { SearchResult } from "protocol";

import { decodeRows } from "#shared/sql";

const ResultRow = Schema.Struct({
  id: Schema.Int,
  guid: Schema.String,
  pathname: Schema.String,
  kind: AssetKind,
  package_id: Schema.Int,
  package_name: Schema.String,
  package_kind: PackageKind,
  images: Schema.Int,
});

const NO_SCORE = 0;
const NO_IMAGES = 0;
const NO_SCORES = HashMap.empty<number, number>();

type ResultRecord = typeof ResultRow.Type;

const rowsOf = Effect.fn("rowsOf")(function* selectRows(ids: readonly number[]) {
  const sql = yield* SqlClient.SqlClient;
  return yield* Array.match(ids, {
    onEmpty: () => Effect.succeed<readonly ResultRecord[]>([]),
    onNonEmpty: (nonEmpty) =>
      decodeRows(ResultRow)(
        sql`select a.id, a.guid, a.pathname, a.kind, a.package_id, p.name as package_name,
          p.kind as package_kind,
          (select count(*) from images i where i.asset_id = a.id) as images
          from assets a join packages p on p.id = a.package_id
          where ${sql.in("a.id", nonEmpty)}`,
      ),
  });
});

const rowIn =
  (rows: readonly ResultRecord[]) =>
  (id: number): Option.Option<ResultRecord> =>
    pipe(
      rows,
      Array.findFirst((row) => row.id === id),
    );

/** @internal */
const rowsInOrder = Effect.fn("rowsInOrder")(function* selectRowsInOrder(ids: readonly number[]) {
  const rows = yield* rowsOf(ids);
  return pipe(ids, Array.map(rowIn(rows)), Array.getSomes);
});

const resultOf =
  (scores: HashMap.HashMap<number, number>) =>
  (row: ResultRecord): typeof SearchResult.Type => ({
    assetId: row.id,
    guid: row.guid,
    pathname: row.pathname,
    kind: row.kind,
    packageId: row.package_id,
    packageName: row.package_name,
    packageKind: row.package_kind,
    score: pipe(
      HashMap.get(scores, row.id),
      Option.getOrElse(() => NO_SCORE),
    ),
    hasPreview: row.images > NO_IMAGES,
  });

/** @internal */
const unscored = resultOf(NO_SCORES);

export { resultOf, rowsInOrder, unscored };
export type { ResultRecord };
