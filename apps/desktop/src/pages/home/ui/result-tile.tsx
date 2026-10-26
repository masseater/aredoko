import { Array, Option, String, pipe } from "effect";
import type { SearchResult } from "protocol";
import type { ReactNode } from "react";

import { KIND_LABELS } from "#/shared/config";

import { ResultPreview } from "./result-preview.tsx";

const fileNameOf = (pathname: string): string =>
  pipe(
    pathname,
    String.split("/"),
    Array.last,
    Option.getOrElse(() => pathname),
  );

const ResultTile = ({ result }: Readonly<{ result: typeof SearchResult.Type }>): ReactNode => (
  <li className="flex flex-col gap-1.5" title={`${result.pathname}\n${result.packageName}`}>
    <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-md border">
      <ResultPreview result={result} />
    </div>
    <p className="truncate text-xs font-medium">{fileNameOf(result.pathname)}</p>
    <p className="text-muted-foreground truncate text-xs">{`${KIND_LABELS[result.kind]}・${result.packageName}`}</p>
  </li>
);

export { ResultTile };
