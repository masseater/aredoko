import { Array, Option, pipe } from "effect";
import type { SearchResult } from "protocol";
import type { ReactNode } from "react";

import { usePackages } from "#/pages/home/api/queries";

import { BoothOpenButton } from "./booth-open-button.tsx";
import { ImportToUnityButton } from "./import-to-unity-button.tsx";
import { OpenFileButton } from "./open-file-button.tsx";
import { RevealButton } from "./reveal-button.tsx";
import { ShowPackageButton } from "./show-package-button.tsx";

const ResultActions = ({ result }: Readonly<{ result: typeof SearchResult.Type }>): ReactNode => {
  const packages = usePackages();
  const owner = pipe(
    packages.data ?? [],
    Array.findFirst(({ id }) => id === result.packageId),
  );
  const file = Option.fromNullOr(result.file);
  const revealed = pipe(
    file,
    Option.orElse(() =>
      pipe(
        owner,
        Option.map(({ path }) => path),
      ),
    ),
  );
  const booth = pipe(
    owner,
    Option.flatMap(({ booth: item }) => Option.fromNullOr(item)),
  );
  return (
    <div className="flex flex-col gap-2">
      <ImportToUnityButton assetId={result.assetId} />
      {Option.isSome(file) && <OpenFileButton path={file.value} />}
      {Option.isSome(revealed) && <RevealButton path={revealed.value} />}
      <ShowPackageButton id={result.packageId} />
      {Option.isSome(booth) && <BoothOpenButton url={booth.value.url} />}
    </div>
  );
};

export { ResultActions };
