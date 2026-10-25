import { Array, Effect, Option, Schema, pipe } from "effect";
import { SqlClient } from "effect/sql";
import { BoothItem } from "protocol";

import { decodeRows } from "#shared/sql";

import { encodeJson } from "./json.ts";
import { IdRow } from "./rows.ts";

interface PackageFile {
  readonly sourceId: number;
  readonly path: string;
  readonly size: number;
  readonly modifiedAt: number;
}

const BoothRow = Schema.Struct({ booth_item: Schema.NullOr(Schema.fromJsonString(BoothItem)) });

/** @internal */
const boothOf = Effect.fn("boothOf")(function* storedBooth(path: string) {
  const sql = yield* SqlClient.SqlClient;
  const rows = yield* decodeRows(BoothRow)(
    sql`select booth_item from packages where path = ${path}`,
  );
  return pipe(
    Array.head(rows),
    Option.flatMap(({ booth_item: item }) => Option.fromNullOr(item)),
  );
});

/** @internal */
const insertPackage = Effect.fn("insertPackage")(function* insertPackageRow({
  file,
  name,
  summary,
  booth,
}: {
  readonly file: PackageFile;
  readonly name: string;
  readonly summary: string;
  readonly booth: Option.Option<typeof BoothItem.Type>;
}) {
  const sql = yield* SqlClient.SqlClient;
  const boothId = pipe(
    booth,
    Option.map(({ id }) => id),
    Option.getOrNull,
  );
  const encoded = yield* pipe(
    booth,
    Option.match({
      onNone: () => Effect.succeedNone,
      onSome: (item) => Effect.asSome(encodeJson(item)),
    }),
  );
  const boothJson = Option.getOrNull(encoded);
  yield* sql`delete from packages where path = ${file.path}`;
  const rows = yield* decodeRows(IdRow)(
    sql`insert into packages(source_id, kind, path, name, size, modified_at, summary,
        booth_item_id, booth_item)
      values (${file.sourceId}, 'unitypackage', ${file.path}, ${name}, ${file.size},
        ${file.modifiedAt}, ${summary}, ${boothId}, ${boothJson})
      returning id`,
  );
  const { id } = yield* Effect.fromOption(Array.head(rows));
  return id;
});

export { boothOf, insertPackage };
export type { PackageFile };
