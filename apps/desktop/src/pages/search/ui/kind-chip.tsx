import { Array } from "effect";
import type { AssetKind } from "protocol";
import { useCallback } from "react";
import type { ReactNode } from "react";

import { useKinds, useToggleKind } from "#/pages/search/model";
import { KIND_LABELS } from "#/shared/config";
import { Button } from "#/shared/ui/button";

const variantOf = (selected: boolean): "secondary" | "outline" => {
  if (selected) {
    return "secondary";
  }
  return "outline";
};

const KindChip = ({ kind }: Readonly<{ kind: typeof AssetKind.Type }>): ReactNode => {
  const kinds = useKinds();
  const toggle = useToggleKind();
  const selected = Array.contains(kinds, kind);
  const onClick = useCallback(() => {
    toggle(kind);
  }, [toggle, kind]);
  return (
    <Button size="xs" variant={variantOf(selected)} aria-pressed={selected} onClick={onClick}>
      {KIND_LABELS[kind]}
    </Button>
  );
};

export { KindChip };
