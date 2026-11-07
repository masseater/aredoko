import type { ReactNode } from "react";
import { Button } from "ui/button";

const ActionButton = ({
  onClick,
  children,
}: Readonly<{ onClick: () => void; children: ReactNode }>): ReactNode => (
  <Button variant="outline" size="sm" className="self-start" onClick={onClick}>
    {children}
  </Button>
);

export { ActionButton };
