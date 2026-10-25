import { Array, Option, pipe } from "effect";
import type { ReactNode } from "react";

import { useSelectedPackage } from "#/pages/library/model";
import { usePackages } from "#/shared/api";

import { BoothSection } from "./booth-section.tsx";
import { PackageHeader } from "./package-header.tsx";
import { PackageSummary } from "./package-summary.tsx";

const NOTHING_SELECTED = "左の一覧からパッケージを選ぶと、中身と BOOTH の情報が表示されます。";

const PackageDetail = (): ReactNode => {
  const selected = useSelectedPackage();
  const packages = usePackages();
  const item = pipe(
    selected,
    Option.flatMap((id) =>
      pipe(
        packages.data ?? [],
        Array.findFirst((candidate) => candidate.id === id),
      ),
    ),
  );
  if (Option.isNone(item)) {
    return <p className="text-muted-foreground text-sm">{NOTHING_SELECTED}</p>;
  }
  return (
    <article className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto">
      <PackageHeader item={item.value} />
      <PackageSummary summary={item.value.summary} />
      <BoothSection item={item.value} />
    </article>
  );
};

export { PackageDetail };
