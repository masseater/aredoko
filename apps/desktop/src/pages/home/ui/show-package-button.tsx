import { Package } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "ui/button";

import { useShowPackage } from "#/pages/home/model";

const LABEL = "パッケージを表示";

const ShowPackageButton = ({ id }: Readonly<{ id: number }>): ReactNode => {
  const showPackage = useShowPackage();
  const onClick = useCallback(() => {
    showPackage(id);
  }, [showPackage, id]);
  return (
    <Button variant="outline" size="sm" className="self-start" onClick={onClick}>
      <Package />
      {LABEL}
    </Button>
  );
};

export { ShowPackageButton };
