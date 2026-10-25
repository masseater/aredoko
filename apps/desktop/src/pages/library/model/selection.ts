import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { Option } from "effect";
import { Atom } from "effect/reactivity";

const selectedAtom = Atom.make<Option.Option<number>>(Option.none());

const filterAtom = Atom.make("");

const useSelectedPackage = (): Option.Option<number> => useAtomValue(selectedAtom);

const useSelectPackage = (): ((id: Option.Option<number>) => void) => useAtomSet(selectedAtom);

const usePackageFilter = (): string => useAtomValue(filterAtom);

const useSetPackageFilter = (): ((filter: string) => void) => useAtomSet(filterAtom);

export { usePackageFilter, useSelectPackage, useSelectedPackage, useSetPackageFilter };
