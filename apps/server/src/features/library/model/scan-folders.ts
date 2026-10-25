import { Array, Effect, FileSystem, HashSet, Option, Path, String, pipe } from "effect";
import { SqlClient } from "effect/sql";

import { decodeRows } from "#shared/sql";

import { indexPackage } from "./index-package.ts";
import type { PackageFile } from "./package-row.ts";
import { PackageFileRow, SourcePathRow } from "./rows.ts";

const PACKAGE_EXTENSION = ".unitypackage";
const UNKNOWN_TIME = 0;

type Source = typeof SourcePathRow.Type;

type KnownPackage = typeof PackageFileRow.Type;

const keyOf = ({ path, size, modifiedAt }: PackageFile): string =>
  `${path}\n${size.toString()}\n${modifiedAt.toString()}`;

const knownKey = ({ path, size, modified_at: modifiedAt }: KnownPackage): string =>
  `${path}\n${size.toString()}\n${modifiedAt.toString()}`;

const isPackage = (name: string): boolean =>
  pipe(name, String.toLowerCase, String.endsWith(PACKAGE_EXTENSION));

const fileOf = Effect.fn("fileOf")(function* statFile({ id, path: root }: Source, name: string) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const full = path.join(root, name);
  const info = yield* fileSystem.stat(full);
  return {
    sourceId: id,
    path: full,
    size: globalThis.Number(info.size),
    modifiedAt: pipe(
      info.mtime,
      Option.map((date) => date.getTime()),
      Option.getOrElse(() => UNKNOWN_TIME),
    ),
  } satisfies PackageFile;
});

const filesOf = Effect.fn("filesOf")(function* listPackageFiles(source: Source) {
  const fileSystem = yield* FileSystem.FileSystem;
  const names = yield* fileSystem.readDirectory(source.path, { recursive: true });
  return yield* pipe(
    names,
    Array.filter(isPackage),
    Effect.forEach((name) => fileOf(source, name)),
  );
});

const currentFiles = Effect.fn("currentFiles")(function* listCurrentFiles() {
  const sql = yield* SqlClient.SqlClient;
  const sources = yield* decodeRows(SourcePathRow)(
    sql`select id, path from sources where kind = 'folder'`,
  );
  const files = yield* pipe(
    sources,
    Effect.forEach((source) =>
      filesOf(source).pipe(Effect.orElseSucceed((): readonly PackageFile[] => [])),
    ),
  );
  return Array.flatten(files);
});

const removeStale = Effect.fn("removeStale")(function* removeStalePackages(
  known: readonly KnownPackage[],
  files: readonly PackageFile[],
) {
  const sql = yield* SqlClient.SqlClient;
  const present = HashSet.fromIterable(
    pipe(
      files,
      Array.map(({ path }) => path),
    ),
  );
  const stale = pipe(
    known,
    Array.filter(({ path }) => !HashSet.has(present, path)),
  );
  yield* pipe(
    stale,
    Effect.forEach(({ id }) => sql`delete from packages where id = ${id}`),
  );
});

/** @internal */
const scanFolders = Effect.fn("scanFolders")(function* scanSourceFolders(
  onPackage: (path: string) => Effect.Effect<void>,
) {
  const sql = yield* SqlClient.SqlClient;
  const files = yield* currentFiles();
  const known = yield* decodeRows(PackageFileRow)(
    sql`select id, path, size, modified_at from packages where kind = 'unitypackage'`,
  );
  yield* removeStale(known, files);
  const unchanged = HashSet.fromIterable(pipe(known, Array.map(knownKey)));
  const changed = pipe(
    files,
    Array.filter((file) => !HashSet.has(unchanged, keyOf(file))),
  );
  yield* pipe(
    changed,
    Effect.forEach((file) =>
      onPackage(file.path).pipe(
        Effect.andThen(indexPackage(file)),
        Effect.catchCause((cause) => Effect.logWarning("index failed", file.path, cause)),
      ),
    ),
  );
});

export { scanFolders };
