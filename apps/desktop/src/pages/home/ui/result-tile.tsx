import { Option } from "effect";
import type { SearchResult } from "protocol";
import { useCallback } from "react";
import type { ReactNode } from "react";

import { KIND_LABELS } from "#/pages/home/config";
import { useSelectResult, useSelectedResult } from "#/pages/home/model";

import { fileNameOf } from "./file-name.ts";
import { TileThumbnail } from "./tile-thumbnail.tsx";

const ResultTile = ({ result }: Readonly<{ result: typeof SearchResult.Type }>): ReactNode => {
  const selected = useSelectedResult();
  const select = useSelectResult();
  const active = Option.exists(selected, ({ assetId }) => assetId === result.assetId);
  const onClick = useCallback(() => {
    select(Option.some(result));
  }, [select, result]);
  return (
    <li>
      <button
        type="button"
        aria-pressed={active}
        title={`${result.pathname}\n${result.packageName}`}
        onClick={onClick}
        className="group focus-visible:ring-ring flex w-full flex-col gap-1.5 rounded-lg p-1 text-left outline-none focus-visible:ring-2"
      >
        <TileThumbnail result={result} active={active} />
        <span className="truncate text-xs font-medium">{fileNameOf(result.pathname)}</span>
        <span className="text-muted-foreground truncate text-xs">{`${KIND_LABELS[result.kind]}・${result.packageName}`}</span>
      </button>
    </li>
  );
};

export { ResultTile };
