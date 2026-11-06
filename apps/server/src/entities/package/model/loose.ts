import { Array, String, pipe } from "effect";

import { kindOf } from "./kind.ts";

const LOOSE_KINDS = ["texture", "model", "audio"] as const;
const COMPANION_EXTENSIONS = [".mtl", ".bin"] as const;
const HIDDEN = ".";
const SEPARATOR = /[\\/]/u;

const isHidden = (name: string): boolean =>
  pipe(
    name,
    String.split(SEPARATOR),
    Array.some((part) => pipe(part, String.startsWith(HIDDEN))),
  );

const isLoose = (name: string): boolean =>
  pipe(
    LOOSE_KINDS,
    Array.some((kind) => kind === kindOf(name)),
  ) && !isHidden(name);

const isCompanion = (name: string): boolean =>
  pipe(
    COMPANION_EXTENSIONS,
    Array.some((extension) => pipe(name, String.toLowerCase, String.endsWith(extension))),
  ) && !isHidden(name);

export { isCompanion, isLoose };
