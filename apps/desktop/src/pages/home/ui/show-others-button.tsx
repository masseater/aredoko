import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { useShowOthers } from "#/pages/home/model";

const SHOW_LABELS = { true: "近いものを見る", false: "ほかの候補を見る" } as const;

const ShowOthersButton = ({ nothingClose }: Readonly<{ nothingClose: boolean }>): ReactNode => {
  const show = useShowOthers();
  const label = SHOW_LABELS[`${nothingClose}`];
  return (
    <Button variant="outline" size="sm" className="self-start" onClick={show}>
      <ChevronDown />
      {label}
    </Button>
  );
};

export { ShowOthersButton };
