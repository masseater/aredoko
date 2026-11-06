import {
  Array,
  Effect,
  FileSystem,
  Number,
  Option,
  Order,
  Path,
  Record,
  String,
  pipe,
} from "effect";

import { isLoose } from "#entities/package";

import type { PackageFile } from "./package-row.ts";

const SEPARATOR = "/";
const UNKNOWN_TIME = 0;
const SINGLE = 1;

interface Member {
  readonly pathname: string;
  readonly file: string;
  readonly size: number;
  readonly modifiedAt: number;
}

interface Bundle extends PackageFile {
  readonly name: string;
  readonly members: readonly Member[];
}

const partsOf = (name: string): readonly string[] =>
  pipe(name, String.replaceAll("\\", SEPARATOR), String.split(SEPARATOR));

const memberOf = Effect.fn("memberOf")(function* statMember(root: string, name: string) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const file = path.join(root, name);
  const info = yield* fileSystem.stat(file);
  return {
    pathname: pipe(partsOf(name), Array.join(SEPARATOR)),
    file,
    size: globalThis.Number(info.size),
    modifiedAt: pipe(
      info.mtime,
      Option.map((date) => date.getTime()),
      Option.getOrElse(() => UNKNOWN_TIME),
    ),
  } satisfies Member;
});

const topOf = ({ pathname }: Member): string =>
  pipe(
    partsOf(pathname),
    Array.head,
    Option.getOrElse(() => pathname),
  );

const bundleOf =
  (sourceId: number, root: string, path: Path.Path) =>
  (members: Array.NonEmptyReadonlyArray<Member>): Bundle => {
    const first = Array.headNonEmpty(members);
    const top = topOf(first);
    const single = members.length === SINGLE && top === first.pathname;
    return {
      sourceId,
      path: path.join(root, top),
      name: pipe(
        Option.liftPredicate(top, () => single),
        Option.map((name) => path.parse(name).name),
        Option.getOrElse(() => top),
      ),
      size: pipe(
        members,
        Array.map(({ size }) => size),
        Number.sumAll,
      ),
      modifiedAt: pipe(
        members,
        Array.map(({ modifiedAt }) => modifiedAt),
        Array.max(Order.Number),
      ),
      members,
    };
  };

/** @internal */
const bundlesIn = Effect.fn("bundlesIn")(function* listBundles(
  { id, path: root }: { readonly id: number; readonly path: string },
  names: readonly string[],
) {
  const path = yield* Path.Path;
  const members = yield* pipe(
    names,
    Array.filter(isLoose),
    Effect.forEach((name) => memberOf(root, name)),
  );
  return pipe(members, Array.groupBy(topOf), Record.values, Array.map(bundleOf(id, root, path)));
});

export { bundlesIn };
export type { Bundle, Member };
