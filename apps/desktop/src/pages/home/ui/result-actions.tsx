import { Option } from "effect";
import type { SearchResult } from "protocol";
import type { ReactNode } from "react";

import { BoothOpenButton } from "./booth-open-button.tsx";
import { ImportToUnityButton } from "./import-to-unity-button.tsx";
import { OpenFileButton } from "./open-file-button.tsx";
import { RevealButton } from "./reveal-button.tsx";
import { ShowPackageButton } from "./show-package-button.tsx";
import { useResultLinks } from "./use-result-links.ts";

const ResultActions = ({ result }: Readonly<{ result: typeof SearchResult.Type }>): ReactNode => {
  const { file, revealed, booth } = useResultLinks(result);
  return (
    <div className="flex flex-col gap-2">
      <ImportToUnityButton assetId={result.assetId} />
      {Option.isSome(file) && <OpenFileButton path={file.value} />}
      {Option.isSome(revealed) && <RevealButton path={revealed.value} />}
      <ShowPackageButton id={result.packageId} />
      {Option.isSome(booth) && <BoothOpenButton url={booth.value} />}
    </div>
  );
};

export { ResultActions };
