import { Array, Effect, HashMap, Option, Schema, String, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { vectorBytes } from "#shared/database";
import { Embedder } from "#shared/embedding";
import { decodeRows } from "#shared/sql";

import { combine } from "./combine.ts";
import type { Hit } from "./combine.ts";
import { resultOf, rowsInOrder } from "./result-row.ts";
import type { ResultRecord } from "./result-row.ts";

const CANDIDATES = 200;

const RankRow = Schema.Struct({ id: Schema.Int });

const HitRow = Schema.Struct({ id: Schema.Int, distance: Schema.Finite });

const FULL_SIMILARITY = 1;

type RankRows = readonly (typeof RankRow.Type)[];

const termsOf = (query: string): readonly string[] =>
  pipe(query, String.toLowerCase, String.split(/[\s　]+/u), Array.filter(String.isNonEmpty));

const idsOf = (rows: RankRows): readonly number[] =>
  pipe(
    rows,
    Array.map(({ id }) => id),
    Array.dedupe,
  );

const hitsOf = (rows: readonly (typeof HitRow.Type)[]): readonly Hit[] =>
  pipe(
    rows,
    Array.map(({ id, distance }) => ({ id, similarity: FULL_SIMILARITY - distance })),
  );

const vectorRankings = Effect.fn("vectorRankings")(function* rankByVector(query: string) {
  const sql = yield* SqlClient.SqlClient;
  const embedder = yield* Embedder;
  const embedded = yield* embedder.embedQuery(query);
  const vector = vectorBytes(embedded);
  const candidates = sql.literal(CANDIDATES.toString());
  const images = yield* decodeRows(HitRow)(
    sql`select i.asset_id as id, v.distance from image_vectors v join images i on i.id = v.rowid
      where v.embedding match ${vector} and k = ${candidates}`,
  );
  const texts = yield* decodeRows(HitRow)(
    sql`select rowid as id, distance from text_vectors
      where embedding match ${vector} and k = ${candidates}`,
  );
  return [hitsOf(images), hitsOf(texts)] as const;
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

const ofPackage =
  (packageId: number | null) =>
  (row: ResultRecord): boolean =>
    Option.match(Option.fromNullOr(packageId), {
      onNone: () => true,
      onSome: (id) => row.package_id === id,
    });

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
  packageId,
}: {
  readonly query: string;
  readonly limit: number;
  readonly kinds: readonly string[];
  readonly packageId: number | null;
}) {
  const [images, texts] = yield* vectorRankings(query);
  const names = yield* nameRanking(query);
  const ranked = combine({ images, texts, names });
  const candidates = pipe(
    ranked,
    Array.map(([id]) => id),
  );
  const rows = yield* rowsInOrder(candidates);
  const scores = HashMap.fromIterable(ranked);
  return pipe(
    rows,
    Array.filter(ofKinds(kinds)),
    Array.filter(ofPackage(packageId)),
    Array.take(limit),
    Array.map(resultOf(scores)),
  );
});

export { search };
