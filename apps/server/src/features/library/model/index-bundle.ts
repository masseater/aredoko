import { Array, Effect, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { summarize } from "#entities/package";

import { embedTexts } from "./embed-texts.ts";
import { insertAssets } from "./insert-assets.ts";
import { encodeJson } from "./json.ts";
import { assetOf, entryOf } from "./loose-asset.ts";
import type { Bundle } from "./loose-files.ts";
import { labelOf } from "./name.ts";
import { boothOf, insertPackage } from "./package-row.ts";

/** @internal */
const indexBundle = Effect.fn("indexBundle")(function* indexLooseFiles(bundle: Bundle) {
  const sql = yield* SqlClient.SqlClient;
  const { name, members } = bundle;
  const entries = pipe(members, Array.map(entryOf));
  const summary = yield* encodeJson(summarize({ name, entries }));
  const booth = yield* boothOf(bundle.path);
  const assets = yield* pipe(members, Effect.forEach(assetOf));
  const packageName = labelOf({ name, booth });
  const packageId = yield* sql.withTransaction(
    Effect.gen(function* write() {
      const id = yield* insertPackage({ kind: "files", file: bundle, name, summary, booth });
      yield* insertAssets({ packageId: id, packageName, assets });
      return id;
    }),
  );
  yield* embedTexts(packageId);
});

export { indexBundle };
