import type { ReactNode } from "react";

import { useQueryText } from "#/pages/home/model";

import { LibraryView } from "./library-view.tsx";
import { SearchView } from "./search-view.tsx";

const HomeBody = (): ReactNode => {
  if (useQueryText() === "") {
    return <LibraryView />;
  }
  return <SearchView />;
};

export { HomeBody };
