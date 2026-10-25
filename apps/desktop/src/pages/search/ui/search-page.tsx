import type { ReactNode } from "react";

import { PageHeader } from "#/shared/ui/page-header";

import { KindChips } from "./kind-chips.tsx";
import { SearchForm } from "./search-form.tsx";
import { SearchResults } from "./search-results.tsx";

const TITLE = "検索を試す";

const SearchPage = (): ReactNode => (
  <section className="flex min-h-0 flex-1 flex-col gap-4">
    <PageHeader title={TITLE} />
    <SearchForm />
    <KindChips />
    <SearchResults />
  </section>
);

export { SearchPage };
