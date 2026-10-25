import { Array, String, pipe } from "effect";
import type { ReactNode } from "react";

import { usePackageFilter } from "#/pages/library/model";
import { usePackages } from "#/shared/api";

import { PackageListItem } from "./package-list-item.tsx";

const LOADING = "読み込んでいます…";
const EMPTY = "パッケージがありません。「探す場所」でフォルダを登録してください。";

const PackageList = (): ReactNode => {
  const packages = usePackages();
  const filter = String.toLowerCase(String.trim(usePackageFilter()));
  if (packages.isPending) {
    return <p className="text-muted-foreground px-3 text-sm">{LOADING}</p>;
  }
  if (packages.isError) {
    return <p className="text-destructive px-3 text-sm">{packages.error.message}</p>;
  }
  if (Array.isReadonlyArrayEmpty(packages.data)) {
    return <p className="text-muted-foreground px-3 text-sm">{EMPTY}</p>;
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
