import { Array, String, pipe } from "effect";
import type { ReactNode } from "react";

import { usePackages } from "#/pages/home/api/queries";
import { usePackageFilter } from "#/pages/home/model";

import { PackageListItem } from "./package-list-item.tsx";

const LOADING = "読み込んでいます…";

const PackageList = (): ReactNode => {
  const packages = usePackages();
  const filter = String.toLowerCase(String.trim(usePackageFilter()));
  if (packages.isPending) {
    return <p className="text-muted-foreground px-3 text-sm">{LOADING}</p>;
  }
  if (packages.isError) {
    return <p className="text-destructive px-3 text-sm">{packages.error.message}</p>;
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {pipe(
        packages.data,
        Array.filter((item) => String.includes(filter)(String.toLowerCase(item.name))),
        Array.map((item) => (
          <li key={item.id}>
            <PackageListItem item={item} />
          </li>
        )),
      )}
    </ul>
  );
};

export { PackageList };
