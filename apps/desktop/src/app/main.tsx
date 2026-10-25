import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { SearchPage } from "#/pages/search";

const root = document.querySelector("#root");

if (root !== null) {
  createRoot(root).render(
    <StrictMode>
      <SearchPage />
    </StrictMode>,
  );
}
