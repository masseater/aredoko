import { Array, Option, pipe } from "effect";
import type { ReactNode } from "react";

import { usePackages } from "#/pages/home/api/queries";
import { useSelectedPackage } from "#/pages/home/model";

import { BoothSection } from "./booth-section.tsx";
import { PackageHeader } from "./package-header.tsx";
import { PackageSummary } from "./package-summary.tsx";

const ScopeHeader = (): ReactNode => {
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
    return false;
  }
  return (
    <section className="bg-card flex shrink-0 flex-wrap gap-6 rounded-lg border p-4">
      <div className="flex min-w-64 flex-1 flex-col gap-3">
        <PackageHeader item={item.value} />
        <PackageSummary summary={item.value.summary} />
      </div>
      <div className="w-80">
        <BoothSection item={item.value} />
      </div>
    </section>
  );
};

export { ScopeHeader };
