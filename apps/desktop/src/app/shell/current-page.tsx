import type { ComponentType, ReactNode } from "react";

import { LibraryPage } from "#/pages/library";
import { SearchPage } from "#/pages/search";
import { SettingsPage } from "#/pages/settings";
import { SourcesPage } from "#/pages/sources";
import { usePage } from "#/shared/model";
import type { Page } from "#/shared/model";

const PAGES: Readonly<Record<Page, ComponentType>> = {
  library: LibraryPage,
  sources: SourcesPage,
  search: SearchPage,
  settings: SettingsPage,
};

const CurrentPage = (): ReactNode => {
  const Current = PAGES[usePage()];
  return <Current />;
};

export { CurrentPage };
