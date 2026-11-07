import { Array, Effect, Option, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { ASSET_ORDER, vectorBytes } from "#shared/database";
import { Embedder } from "#shared/embedding";
import { decodeRows } from "#shared/sql";

import { ImageRow } from "./rows.ts";

const IMAGE_BATCH = 8;
const NO_IMAGES = 0;

type Image = typeof ImageRow.Type;

interface AnalyzedAsset {
  readonly assetId: number;
  readonly pathname: string;
}

const save = Effect.fn("saveImageVector")(function* saveImageVector(
  { id }: Image,
  vector: readonly number[],
) {
  const sql = yield* SqlClient.SqlClient;
  const embedding = vectorBytes(vector);
  yield* sql`insert into image_vectors(rowid, embedding) values (cast(${id} as integer), ${embedding})`;
  yield* sql`update images set embedded = 1 where id = ${id}`;
});

const markFailed = Effect.fn("markImageFailed")(function* markImageFailed({ id }: Image) {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`update images set embedded = -1 where id = ${id}`;
});

const embedBatch = Effect.fn("embedBatch")(function* embedImageBatch(images: readonly Image[]) {
  const embedder = yield* Embedder;
  const vectors = yield* embedder.embedImages(
    pipe(
      images,
      Array.map(({ png }) => png),
    ),
  );
  yield* pipe(
    images,
    Array.zip(vectors),
    Effect.forEach(([image, vector]) => save(image, vector)),
  );
});

const embedOneByOne = Effect.fn("embedOneByOne")(function* embedOneByOne(images: readonly Image[]) {
  yield* pipe(
    images,
    Effect.forEach((image) => embedBatch([image]).pipe(Effect.catchCause(() => markFailed(image)))),
  );
});

const embedPending = Effect.fn("embedPending")(function* embedPendingImages(
  onAsset: (asset: AnalyzedAsset) => Effect.Effect<void>,
) {
  const sql = yield* SqlClient.SqlClient;
  const pending = yield* decodeRows(ImageRow)(
    sql`select i.id, i.png, i.asset_id, a.pathname from images i join assets a on a.id = i.asset_id
      where i.embedded = 0
      order by ${sql.literal(ASSET_ORDER)}, i.id
      limit ${IMAGE_BATCH}`,
  );
  yield* pipe(
    Array.head(pending),
    Option.match({
      onNone: () => Effect.void,
      onSome: ({ asset_id: assetId, pathname }) => onAsset({ assetId, pathname }),
    }),
  );
  yield* embedBatch(pending).pipe(Effect.catchCause(() => embedOneByOne(pending)));
  return pending.length;
});

/** @internal */
const embedImages = Effect.fn("embedImages")(function* embedAllImages(
  onAsset: (asset: AnalyzedAsset) => Effect.Effect<void>,
) {
  yield* embedPending(onAsset).pipe(Effect.repeat({ while: (count) => count > NO_IMAGES }));
});

export { embedImages };
export type { AnalyzedAsset };
