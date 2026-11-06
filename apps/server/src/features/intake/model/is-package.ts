import { String, pipe } from "effect";

const PACKAGE_EXTENSION = ".unitypackage";
const ZIP_EXTENSION = ".zip";

const endsWith =
  (extension: string) =>
  (name: string): boolean =>
    pipe(name, String.toLowerCase, String.endsWith(extension));

const isPackage = endsWith(PACKAGE_EXTENSION);

const isZip = endsWith(ZIP_EXTENSION);

export { isPackage, isZip };
