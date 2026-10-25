import type { ReactNode } from "react";

import { PageHeader } from "#/shared/ui/page-header";

import { AddFolderButton } from "./add-folder-button.tsx";
import { ReindexButton } from "./reindex-button.tsx";
import { SourceList } from "./source-list.tsx";

const TITLE = "探す場所";
const DESCRIPTION =
  "unitypackage を置いているフォルダを登録すると、中のアセットを Unity から日本語で探せるようになります。サブフォルダの中も探します。";

const SourcesPage = (): ReactNode => (
  <section className="flex flex-col gap-6">
    <PageHeader title={TITLE} description={DESCRIPTION} />
    <div className="flex gap-2">
      <AddFolderButton />
      <ReindexButton />
    </div>
    <SourceList />
  </section>
);

export { SourcesPage };
