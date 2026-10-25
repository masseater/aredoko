import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { Atom } from "effect/reactivity";

type Page = "library" | "sources" | "search" | "settings";

const pageAtom = Atom.make<Page>("library");

const usePage = (): Page => useAtomValue(pageAtom);

const useOpenPage = (): ((page: Page) => void) => useAtomSet(pageAtom);

export type { Page };
export { useOpenPage, usePage };
