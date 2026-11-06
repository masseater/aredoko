import { Array, Effect, Schema, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { decodeRows } from "#shared/sql";

import { rowsInOrder, unscored } from "./result-row.ts";

const IdRow = Schema.Struct({ id: Schema.Int });

const CountRow = Schema.Struct({ total: Schema.Int });

interface BrowseQuery {
  readonly packageId: number | null;
  readonly kinds: readonly string[];
  readonly offset: number;
  readonly limit: number;
}

const NO_ASSETS = 0;

/** @internal */
const browse = Effect.fn("browse")(function* browseAssets({
  packageId,
  kinds,
  offset,
  limit,
}: BrowseQuery) {
  const sql = yield* SqlClient.SqlClient;
  const ofKinds = Array.match(kinds, {
    onEmpty: () => sql`1 = 1`,
    onNonEmpty: (nonEmpty) => sql.in("a.kind", nonEmpty),
  });
  const where = sql`where (${packageId} is null or a.package_id = ${packageId}) and ${ofKinds}`;
  const ids = yield* decodeRows(IdRow)(
    sql`select a.id from assets a ${where} order by a.package_id desc, a.pathname
      limit ${limit} offset ${offset}`,
  );
  const rows = yield* rowsInOrder(
    pipe(
      ids,
      Array.map(({ id }) => id),
    ),
  );
  const [counted = { total: NO_ASSETS }] = yield* decodeRows(CountRow)(
    sql`select count(*) as total from assets a ${where}`,
  );
  return { assets: pipe(rows, Array.map(unscored)), total: counted.total };
});

export { browse };
export type { BrowseQuery };
