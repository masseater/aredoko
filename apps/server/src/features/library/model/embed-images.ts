import { Effect, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { vectorBytes } from "#shared/database";
import { Embedder } from "#shared/embedding";
import { decodeRows } from "#shared/sql";

import { ImageRow } from "./rows.ts";

const IMAGE_BATCH = 8;
const NO_IMAGES = 0;

type Image = typeof ImageRow.Type;

const embedImage = Effect.fn("embedImage")(function* embedOneImage({ id, png }: Image) {
  const sql = yield* SqlClient.SqlClient;
  const embedder = yield* Embedder;
  const vector = yield* embedder.embedImage(png);
  const embedding = vectorBytes(vector);
  yield* sql`insert into image_vectors(rowid, embedding) values (cast(${id} as integer), ${embedding})`;
  yield* sql`update images set embedded = 1 where id = ${id}`;
});

const embedPending = Effect.fn("embedPending")(function* embedPendingImages() {
  const sql = yield* SqlClient.SqlClient;
  const pending = yield* decodeRows(ImageRow)(
    sql`select id, png from images where embedded = 0 limit ${IMAGE_BATCH}`,
  );
  yield* pipe(
    pending,
    Effect.forEach((image) =>
      embedImage(image).pipe(
        Effect.catchCause(() => sql`update images set embedded = -1 where id = ${image.id}`),
      ),
    ),
  );
  return pending.length;
});

/** @internal */
const embedImages = embedPending().pipe(Effect.repeat({ while: (count) => count > NO_IMAGES }));

export { embedImages };
