import type { ComponentType, ReactNode } from "react";

import { HomePage } from "#/pages/home";
import { SettingsPage } from "#/pages/settings";
import { usePage } from "#/shared/model";
import type { Page } from "#/shared/model";

const PAGES: Readonly<Record<Page, ComponentType>> = {
  home: HomePage,
  settings: SettingsPage,
};

const CurrentPage = (): ReactNode => {
  const Current = PAGES[usePage()];
  return <Current />;
};

export { CurrentPage };
