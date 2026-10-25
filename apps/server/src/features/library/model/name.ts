import { Array, Option, String, pipe } from "effect";
import type { BoothItem } from "protocol";

const nameOf = (path: string): string =>
  pipe(
    path,
    String.split(/[\\/]/u),
    Array.last,
    Option.getOrElse(() => path),
    String.replace(/\.unitypackage$/iu, ""),
  );

const boothWords = ({ name, shop, tags }: typeof BoothItem.Type): readonly string[] => [
  name,
  shop,
  ...tags,
];

const labelOf = ({
  name,
  booth,
}: {
  readonly name: string;
  readonly booth: Option.Option<typeof BoothItem.Type>;
}): string =>
  pipe(
    booth,
    Option.map(boothWords),
    Option.getOrElse((): readonly string[] => []),
    Array.prepend(name),
    Array.join(" "),
  );

export { labelOf, nameOf };
