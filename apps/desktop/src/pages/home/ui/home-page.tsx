import type { ReactNode } from "react";

import { HomeBody } from "./home-body.tsx";
import { SearchBar } from "./search-bar.tsx";

const HomePage = (): ReactNode => (
  <section className="flex min-h-0 flex-1 flex-col gap-4">
    <SearchBar />
    <HomeBody />
  </section>
);

export { HomePage };
