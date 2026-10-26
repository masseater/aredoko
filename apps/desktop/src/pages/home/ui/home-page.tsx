import type { ReactNode } from "react";

import { LibraryColumn } from "./library-column.tsx";
import { MainPane } from "./main-pane.tsx";
import { SearchBar } from "./search-bar.tsx";

const HomePage = (): ReactNode => (
  <section className="flex min-h-0 flex-1 flex-col gap-4">
    <SearchBar />
    <div className="flex min-h-0 flex-1 gap-6">
      <LibraryColumn />
      <MainPane />
    </div>
  </section>
);

export { HomePage };
