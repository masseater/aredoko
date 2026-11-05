import { Array, Option, pipe } from "effect";
import type { SearchResult } from "protocol";
import type { ReactNode } from "react";

import { usePackages } from "#/pages/home/api/queries";

import { ImportToUnityButton } from "./import-to-unity-button.tsx";
import { PackageLinks } from "./package-links.tsx";
import { ShowPackageButton } from "./show-package-button.tsx";

const ResultActions = ({ result }: Readonly<{ result: typeof SearchResult.Type }>): ReactNode => {
  const packages = usePackages();
  const owner = pipe(
    packages.data ?? [],
    Array.findFirst(({ id }) => id === result.packageId),
  );
  return (
    <div className="flex flex-col gap-2">
      <ImportToUnityButton assetId={result.assetId} />
      <ShowPackageButton id={result.packageId} />
      {Option.isSome(owner) && <PackageLinks item={owner.value} />}
    </div>
  );
};

export { ResultActions };
