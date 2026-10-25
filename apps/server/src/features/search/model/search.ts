import { Array, Effect, HashMap, Option, Schema, String, pipe } from "effect";
import { SqlClient } from "effect/sql";
import type { SearchResult } from "protocol";

import { vectorBytes } from "#shared/database";
import { Embedder } from "#shared/embedding";
import { decodeRows } from "#shared/sql";

import { fuse } from "./rrf.ts";

const CANDIDATES = 200;

const RankRow = Schema.Struct({ id: Schema.Int });

const ResultRow = Schema.Struct({
  id: Schema.Int,
  guid: Schema.String,
  pathname: Schema.String,
  kind: Schema.Literals([
    "texture",
    "model",
    "material",
    "prefab",
    "shader",
    "animation",
    "audio",
    "scene",
    "script",
    "other",
  ]),
  package_id: Schema.Int,
  package_name: Schema.String,
  package_kind: Schema.Literals(["unitypackage", "project"]),
  images: Schema.Int,
});

const NO_SCORE = 0;
const NO_IMAGES = 0;

type RankRows = readonly (typeof RankRow.Type)[];

type ResultRecord = typeof ResultRow.Type;

const termsOf = (query: string): readonly string[] =>
  pipe(query, String.toLowerCase, String.split(/[\s　]+/u), Array.filter(String.isNonEmpty));

const idsOf = (rows: RankRows): readonly number[] =>
  pipe(
    rows,
    Array.map(({ id }) => id),
    Array.dedupe,
  );

const vectorRankings = Effect.fn("vectorRankings")(function* rankByVector(query: string) {
  const sql = yield* SqlClient.SqlClient;
  const embedder = yield* Embedder;
  const vector = vectorBytes(yield* embedder.embedQuery(query));
  const candidates = sql.literal(CANDIDATES.toString());
  const images = yield* decodeRows(RankRow)(
    sql`select i.asset_id as id from image_vectors v join images i on i.id = v.rowid
      where v.embedding match ${vector} and k = ${candidates} order by v.distance`,
  );
  const texts = yield* decodeRows(RankRow)(
    sql`select rowid as id from text_vectors
      where embedding match ${vector} and k = ${candidates} order by distance`,
  );
  return [idsOf(images), idsOf(texts)] as const;
});

const nameRanking = Effect.fn("nameRanking")(function* rankByName(query: string) {
  const sql = yield* SqlClient.SqlClient;
  const rows = yield* Array.match(termsOf(query), {
    onEmpty: () => Effect.succeed<RankRows>([]),
    onNonEmpty: (terms) => {
      const hits = pipe(
        terms,
        Array.map((term) => sql`(instr(lower(text), ${term}) > 0)`),
        sql.join(" + ", false),
      );
      return decodeRows(RankRow)(
        sql`select id from assets where (${hits}) > 0
          order by (${hits}) desc, length(pathname) limit ${CANDIDATES}`,
      );
    },
  });
  return idsOf(rows);
});

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

const rowIn =
  (rows: readonly ResultRecord[]) =>
  (id: number): Option.Option<ResultRecord> =>
    pipe(
      rows,
      Array.findFirst((row) => row.id === id),
    );

const ofKinds =
  (kinds: readonly string[]) =>
  ({ kind }: ResultRecord): boolean =>
    Array.isReadonlyArrayEmpty(kinds) ||
    pipe(
      kinds,
      Array.some((candidate) => candidate === kind),
    );

/** @internal */
const search = Effect.fn("search")(function* searchAssets({
  query,
  limit,
  kinds,
}: {
  readonly query: string;
  readonly limit: number;
  readonly kinds: readonly string[];
}) {
  const [images, texts] = yield* vectorRankings(query);
  const names = yield* nameRanking(query);
  const ranked = fuse([images, texts, names]);
  const candidates = pipe(
    ranked,
    Array.map(([id]) => id),
  );
  const rows = yield* rowsOf(candidates);
  const scores = HashMap.fromIterable(ranked);
  return pipe(
    candidates,
    Array.map(rowIn(rows)),
    Array.getSomes,
    Array.filter(ofKinds(kinds)),
    Array.take(limit),
    Array.map(resultOf(scores)),
  );
});

export { search };
