import { useCallback } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { usePackageFilter, useSetPackageFilter } from "#/pages/home/model";
import { Input } from "#/shared/ui/input";

const PLACEHOLDER = "パッケージ名で絞り込む";

const PackageFilter = (): ReactNode => {
  const filter = usePackageFilter();
  const setFilter = useSetPackageFilter();
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value);
    },
    [setFilter],
  );
  return (
    <Input
      type="search"
      placeholder={PLACEHOLDER}
      aria-label={PLACEHOLDER}
      value={filter}
      onChange={onChange}
    />
  );
};

export { PackageFilter };
