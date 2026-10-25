import { FolderOpen, Library, Search, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { useOpenPage, usePage } from "#/shared/model";
import type { Page } from "#/shared/model";

const ICONS: Readonly<Record<Page, LucideIcon>> = {
  library: Library,
  sources: FolderOpen,
  search: Search,
  settings: Settings,
};

const variantOf = (selected: boolean): "secondary" | "ghost" => {
  if (selected) {
    return "secondary";
  }
  return "ghost";
};

const NavItem = ({ page, label }: Readonly<{ page: Page; label: string }>): ReactNode => {
  const current = usePage();
  const openPage = useOpenPage();
  const open = useCallback(() => {
    openPage(page);
  }, [openPage, page]);
  const Icon = ICONS[page];
  return (
    <Button variant={variantOf(page === current)} className="justify-start" onClick={open}>
      <Icon />
      {label}
    </Button>
  );
};

export { NavItem };
