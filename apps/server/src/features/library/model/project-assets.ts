import { Array, Effect, HashSet, Option, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { summarize } from "#entities/package";
import { decodeRows } from "#shared/sql";
import type { PackageEntry } from "#shared/unitypackage";

import { embedTexts } from "./embed-texts.ts";
import { insertAssets } from "./insert-assets.ts";
import { encodeJson } from "./json.ts";
import { nameOf } from "./name.ts";
import { AssetGuidRow, IdRow } from "./rows.ts";

const NO_SIZE = 0;

type AssetGuid = typeof AssetGuidRow.Type;

const entryOf = ({ guid, pathname }: AssetGuid): PackageEntry => ({
  guid,
  pathname,
  asset: Option.none(),
  meta: Option.none(),
  preview: Option.none(),
  references: [],
});

const projectPackage = Effect.fn("projectPackage")(function* ensureProjectPackage(
  projectPath: string,
) {
  const sql = yield* SqlClient.SqlClient;
  const name = nameOf(projectPath);
  const empty = yield* encodeJson(summarize({ name, entries: [] }));
  yield* sql`insert into sources(path, kind) values (${projectPath}, 'project')
    on conflict(path) do nothing`;
  yield* sql`insert into packages(source_id, kind, path, name, size, modified_at, summary)
    select id, 'project', ${projectPath}, ${name}, ${NO_SIZE}, ${NO_SIZE}, ${empty}
    from sources where path = ${projectPath}
    on conflict(path) do nothing`;
  const rows = yield* decodeRows(IdRow)(sql`select id from packages where path = ${projectPath}`);
  const { id } = yield* Effect.fromOption(Array.head(rows));
  return id;
});

/** @internal */
const putProjectAssets = Effect.fn("putProjectAssets")(function* storeProjectAssets({
  projectPath,
  assets,
}: {
  readonly projectPath: string;
  readonly assets: readonly {
    readonly guid: string;
    readonly pathname: string;
    readonly previews: readonly Uint8Array[];
  }[];
}) {
  const sql = yield* SqlClient.SqlClient;
  const packageId = yield* projectPackage(projectPath);
  const inputs = pipe(
    assets,
    Array.map((asset) => ({ ...asset, references: [] })),
  );
  yield* sql.withTransaction(
    insertAssets({ packageId, packageName: nameOf(projectPath), assets: inputs }),
  );
  yield* embedTexts(packageId);
  return packageId;
});

/** @internal */
const pruneProject = Effect.fn("pruneProject")(function* pruneProjectAssets({
  packageId,
  projectPath,
  seen,
}: {
  readonly packageId: number;
  readonly projectPath: string;
  readonly seen: HashSet.HashSet<string>;
}) {
  const sql = yield* SqlClient.SqlClient;
  const name = nameOf(projectPath);
  const rows = yield* decodeRows(AssetGuidRow)(
    sql`select id, guid, pathname from assets where package_id = ${packageId}`,
  );
  const kept = pipe(
    rows,
    Array.filter(({ guid }) => HashSet.has(seen, guid)),
  );
  const removed = pipe(
    rows,
    Array.filter(({ guid }) => !HashSet.has(seen, guid)),
  );
  yield* pipe(
    removed,
    Effect.forEach(({ id }) => sql`delete from assets where id = ${id}`),
  );
  const entries = pipe(kept, Array.map(entryOf));
  const summary = yield* encodeJson(summarize({ name, entries }));
  yield* sql`update packages set summary = ${summary} where id = ${packageId}`;
});

export { pruneProject, putProjectAssets };
