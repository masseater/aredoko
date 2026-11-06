import { Array, Effect, Schema, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { decodeRows } from "#shared/sql";

const JOBS_PER_REQUEST = 8;
const RENDER_PENDING = 1;
const RENDER_DONE = 2;
const RENDER_FAILED = -1;

const JobRow = Schema.Struct({ assetId: Schema.Int, pathname: Schema.String });

/** @internal */
const renderJobs = Effect.fn("renderJobs")(function* listRenderJobs() {
  const sql = yield* SqlClient.SqlClient;
  return yield* decodeRows(JobRow)(
    sql`select id as assetId, pathname from assets
      where render = ${RENDER_PENDING} order by id limit ${JOBS_PER_REQUEST}`,
  );
});

/** @internal */
const putRender = Effect.fn("putRender")(function* storeRender({
  assetId,
  pngs,
}: {
  readonly assetId: number;
  readonly pngs: readonly Uint8Array[];
}) {
  const sql = yield* SqlClient.SqlClient;
  const state = Array.match(pngs, { onEmpty: () => RENDER_FAILED, onNonEmpty: () => RENDER_DONE });
  yield* sql.withTransaction(
    Effect.gen(function* write() {
      yield* sql`delete from images where asset_id = ${assetId}`;
      yield* pipe(
        pngs,
        Effect.forEach((png) => sql`insert into images(asset_id, png) values (${assetId}, ${png})`),
      );
      yield* sql`update assets set render = ${state} where id = ${assetId}`;
    }),
  );
});

export { putRender, renderJobs };
