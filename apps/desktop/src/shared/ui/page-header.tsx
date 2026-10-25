import type { ReactNode } from "react";

const PageHeader = ({
  title,
  description,
}: Readonly<{ title: string; description: string }>): ReactNode => (
  <header className="flex flex-col gap-1">
    <h2 className="text-xl font-semibold">{title}</h2>
    <p className="text-muted-foreground text-sm">{description}</p>
  </header>
);

export { PageHeader };
