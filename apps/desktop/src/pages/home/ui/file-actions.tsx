import type { ReactNode } from "react";

import { OpenFileButton } from "./open-file-button.tsx";
import { RevealButton } from "./reveal-button.tsx";

const FileActions = ({ path }: Readonly<{ path: string }>): ReactNode => (
  <>
    <OpenFileButton path={path} />
    <RevealButton path={path} />
  </>
);

export { FileActions };
