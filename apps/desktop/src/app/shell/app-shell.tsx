import type { ReactNode } from "react";

import { Sidebar } from "#/widgets/sidebar";

import { CurrentPage } from "./current-page.tsx";

const AppShell = (): ReactNode => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto p-8">
      <CurrentPage />
    </main>
  </div>
);

export { AppShell };
