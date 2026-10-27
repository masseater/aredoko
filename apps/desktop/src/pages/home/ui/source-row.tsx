import type { Source } from "protocol";
import type { ReactNode } from "react";

import { Badge } from "#/shared/ui/badge";

import { RemoveSourceButton } from "./remove-source-button.tsx";

const KIND_LABELS: Readonly<Record<(typeof Source.Type)["kind"], string>> = {
  folder: "フォルダ",
  project: "Unity プロジェクト",
};

const SourceRow = ({ source }: Readonly<{ source: typeof Source.Type }>): ReactNode => (
  <li className="flex items-center gap-2 rounded-md border px-2 py-1.5">
    <Badge variant="secondary">{KIND_LABELS[source.kind]}</Badge>
    <span className="min-w-0 flex-1 truncate text-sm" title={source.path}>
      {source.path}
    </span>
    <span className="text-muted-foreground text-xs">{`${source.packages.toString()} 件`}</span>
    <RemoveSourceButton id={source.id} />
  </li>
);

export { SourceRow };
