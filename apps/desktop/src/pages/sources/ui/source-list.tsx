import { Array, pipe } from "effect";
import type { ReactNode } from "react";

import { useSources } from "#/shared/api";

import { SourceRow } from "./source-row.tsx";

const LOADING = "読み込んでいます…";
const EMPTY =
  "まだ登録されていません。「フォルダを追加」から unitypackage を置いているフォルダを選んでください。";

const SourceList = (): ReactNode => {
  const sources = useSources();
  if (sources.isPending) {
    return <p className="text-muted-foreground text-sm">{LOADING}</p>;
  }
  if (sources.isError) {
    return <p className="text-destructive text-sm">{sources.error.message}</p>;
  }
  if (Array.isReadonlyArrayEmpty(sources.data)) {
    return <p className="text-muted-foreground text-sm">{EMPTY}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {pipe(
        sources.data,
        Array.map((source) => <SourceRow key={source.id} source={source} />),
      )}
    </ul>
  );
};

export { SourceList };
