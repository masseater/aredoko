import { Array, Effect, FileSystem, HashSet, Option, Stream, String, pipe } from "effect";
import type { ParsedTarEntry } from "modern-tar";
import { packTar } from "modern-tar";

import { bodyOf, skip, tarEntries } from "./tar-stream.ts";
import { UnityPackageUnreadable } from "./unity-package-unreadable.ts";

interface Selection {
  readonly source: string;
  readonly guids: HashSet.HashSet<string>;
}

interface TarFile {
  readonly header: ParsedTarEntry["header"];
  readonly body: Uint8Array;
}

const guidOf = ({ header }: ParsedTarEntry): string =>
  pipe(header.name, String.replace(/^\.\//u, ""), String.split("/"), Array.headNonEmpty);

const compress = (tar: Uint8Array): Promise<Uint8Array> =>
  new Response(
    new Blob([Uint8Array.from(tar)]).stream().pipeThrough(new CompressionStream("gzip")),
  ).bytes();

const selected =
  (guids: HashSet.HashSet<string>) =>
  (entry: ParsedTarEntry): boolean =>
    entry.header.type === "file" && HashSet.has(guids, guidOf(entry));

const collect =
  ({ source, guids }: Selection) =>
  (entry: ParsedTarEntry): Effect.Effect<Option.Option<TarFile>, UnityPackageUnreadable> =>
    Option.match(Option.liftPredicate(entry, selected(guids)), {
      onNone: () => Effect.as(skip(entry), Option.none()),
      onSome: ({ header }) =>
        Effect.map(bodyOf(source, entry), (body) => Option.some({ header, body })),
    });

const filesOf = Effect.fn("filesOf")(function* selectedFiles({ source, guids }: Selection) {
  const entries = yield* tarEntries(source);
  const files = yield* entries.pipe(
    Stream.mapEffect(collect({ source, guids })),
    Stream.runCollect,
  );
  return Array.getSomes(files);
});

/** @internal */
const writePackage = Effect.fn("writePackage")(function* writeUnityPackage(
  selections: readonly Selection[],
  destination: string,
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const files = Array.flatten(yield* pipe(selections, Effect.forEach(filesOf)));
  const failed = (cause: unknown): UnityPackageUnreadable =>
    UnityPackageUnreadable.make({ path: destination, cause });
  const tar = yield* Effect.tryPromise({ try: () => packTar(files), catch: failed });
  const archive = yield* Effect.tryPromise({ try: () => compress(tar), catch: failed });
  yield* fileSystem.writeFile(destination, archive);
});

export { writePackage };
export type { Selection };
