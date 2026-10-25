import { Array, pipe } from "effect";
import type { ReactNode } from "react";

import type { Page } from "#/shared/model";

import { NavItem } from "./nav-item.tsx";
import { ServerStatus } from "./server-status.tsx";

const TITLE = "aredoko";

const ITEMS: readonly Readonly<{ page: Page; label: string }>[] = [
  { page: "library", label: "ライブラリ" },
  { page: "sources", label: "探す場所" },
  { page: "search", label: "検索を試す" },
  { page: "settings", label: "設定" },
];

const Sidebar = (): ReactNode => (
  <aside className="bg-card flex w-56 shrink-0 flex-col gap-6 border-r p-4">
    <h1 className="px-2 text-lg font-semibold">{TITLE}</h1>
    <nav className="flex flex-col gap-1">
      {pipe(
        ITEMS,
        Array.map(({ page, label }) => <NavItem key={page} page={page} label={label} />),
      )}
    </nav>
    <div className="mt-auto px-2">
      <ServerStatus />
    </div>
  </aside>
);

export { Sidebar };
