import { FileQuestion } from "lucide-react";
import type { SearchResult } from "protocol";
import type { ReactNode } from "react";

import { LoadedPreview } from "./loaded-preview.tsx";

const ResultPreview = ({ result }: Readonly<{ result: typeof SearchResult.Type }>): ReactNode => {
  if (!result.hasPreview) {
    return <FileQuestion className="text-muted-foreground size-8" />;
  }
  return <LoadedPreview result={result} />;
};

export { ResultPreview };
