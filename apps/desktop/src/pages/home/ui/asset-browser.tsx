import { Array, pipe } from "effect";
import type { ReactNode } from "react";

import { useAssets, useLoadNext } from "#/pages/home/api/queries";
import { useKinds, useSelectedPackage } from "#/pages/home/model";

import { NextPageTrigger } from "./next-page-trigger.tsx";
import { ResultGrid } from "./result-grid.tsx";
import { StillImporting } from "./still-importing.tsx";

const LOADING = "読み込んでいます…";
const EMPTY = "該当するアセットがありません";

const AssetBrowser = (): ReactNode => {
  const assets = useAssets({ packageId: useSelectedPackage(), kinds: useKinds() });
  const onEnd = useLoadNext(assets);
  if (assets.isPending) {
    return <p className="text-muted-foreground text-sm">{LOADING}</p>;
  }
  if (assets.isError) {
    return <p className="text-destructive text-sm">{assets.error.message}</p>;
  }
  const results = pipe(
    assets.data.pages,
    Array.flatMap(({ assets: page }) => page),
  );
  if (Array.isReadonlyArrayEmpty(results)) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">{EMPTY}</p>
        <StillImporting />
      </div>
    );
  }
  return (
    <>
      <ResultGrid results={results} />
      <NextPageTrigger onVisible={onEnd} />
    </>
  );
};

export { AssetBrowser };
