import { LoaderCircle } from "lucide-react";
import type { Status } from "protocol";
import type { ReactNode } from "react";

type StatusData = typeof Status.Type;
type Counter = StatusData["images"];

const stepOf = (packages: Counter, images: Counter): Counter => {
  if (packages.done < packages.total) {
    return packages;
  }
  return images;
};

const IndexingProgress = ({
  packages,
  images,
}: Readonly<Pick<typeof Status.Type, "packages" | "images">>): ReactNode => {
  const { done, total } = stepOf(packages, images);
  return (
    <p className="text-muted-foreground flex items-center gap-2 text-xs tabular-nums">
      <LoaderCircle aria-hidden className="size-4 animate-spin" />
      {`${done.toString()} / ${total.toString()}`}
    </p>
  );
};

export { IndexingProgress };
