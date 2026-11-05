import { Array, Effect, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { vectorBytes } from "#shared/database";
import { Embedder } from "#shared/embedding";
import { decodeRows } from "#shared/sql";

import { ImageRow } from "./rows.ts";

const IMAGE_BATCH = 8;
const NO_IMAGES = 0;

type Image = typeof ImageRow.Type;

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

const embedPending = Effect.fn("embedPending")(function* embedPendingImages() {
  const sql = yield* SqlClient.SqlClient;
  const pending = yield* decodeRows(ImageRow)(
    sql`select id, png from images where embedded = 0 limit ${IMAGE_BATCH}`,
  );
  yield* embedBatch(pending).pipe(Effect.catchCause(() => embedOneByOne(pending)));
  return pending.length;
});

/** @internal */
const embedImages = embedPending().pipe(Effect.repeat({ while: (count) => count > NO_IMAGES }));

export { embedImages };
