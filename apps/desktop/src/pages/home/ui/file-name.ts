import { Array, Option, String, pipe } from "effect";

const fileNameOf = (pathname: string): string =>
  pipe(
    pathname,
    String.split("/"),
    Array.last,
    Option.getOrElse(() => pathname),
  );

export { fileNameOf };
