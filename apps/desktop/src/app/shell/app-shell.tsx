import type { ReactNode } from "react";

import { Header } from "#/widgets/header";

import { CurrentPage } from "./current-page.tsx";

const AppShell = (): ReactNode => (
  <div className="flex h-screen flex-col overflow-hidden">
    <Header />
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
      <CurrentPage />
    </main>
  </div>
);

export { AppShell };
