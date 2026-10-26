import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { Array, pipe } from "effect";
import { Atom } from "effect/reactivity";
import type { AssetKind } from "protocol";

type Kind = typeof AssetKind.Type;

const draftAtom = Atom.make("");

const queryAtom = Atom.make("");

const kindsAtom = Atom.make<readonly Kind[]>([]);

const useDraft = (): string => useAtomValue(draftAtom);

const useSetDraft = (): ((draft: string) => void) => useAtomSet(draftAtom);

const useQueryText = (): string => useAtomValue(queryAtom);

const useSubmitQuery = (): ((query: string) => void) => useAtomSet(queryAtom);

const useKinds = (): readonly Kind[] => useAtomValue(kindsAtom);

const useToggleKind = (): ((kind: Kind) => void) => {
  const kinds = useAtomValue(kindsAtom);
  const setKinds = useAtomSet(kindsAtom);
  return (kind) => {
    if (Array.contains(kinds, kind)) {
      setKinds(
        pipe(
          kinds,
          Array.filter((current) => current !== kind),
        ),
      );
      return;
    }
    setKinds(Array.append(kinds, kind));
  };
};

export { useDraft, useKinds, useQueryText, useSetDraft, useSubmitQuery, useToggleKind };
