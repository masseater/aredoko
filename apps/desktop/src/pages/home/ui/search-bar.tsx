import type { ReactNode } from "react";

import { KindChips } from "./kind-chips.tsx";
import { SearchForm } from "./search-form.tsx";

const SearchBar = (): ReactNode => (
  <div className="flex flex-col gap-2">
    <SearchForm />
    <KindChips />
  </div>
);

export { SearchBar };
