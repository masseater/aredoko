import { Array, HashMap, Option, Order, Record, String, pipe } from "effect";

import { capture } from "#shared/text";
import type { PackageEntry } from "#shared/unitypackage";

import { avatarsIn } from "./avatars.ts";
import { colorsIn } from "./colors.ts";
import { kindOf } from "./kind.ts";
import type { AssetKind } from "./kind.ts";

const STANDARD_SHADER_GUID = "0000000000000000f000000000000000";

const SHADER_MARKERS = [
  { name: "lilToon", marker: "_lilToonVersion" },
  { name: "Poiyomi", marker: "shader_is_using_thry_editor" },
  { name: "UnityChanToonShader", marker: "_utsTechnique" },
] as const;

interface PackageSummary {
  readonly counts: Readonly<Record<string, number>>;
  readonly shaders: readonly string[];
  readonly avatars: readonly string[];
  readonly colors: readonly string[];
}

const decoder = new TextDecoder();

const decode = (bytes: Uint8Array): string => decoder.decode(bytes);

const textOf = ({ asset }: PackageEntry): Option.Option<string> => pipe(asset, Option.map(decode));

const shaderGuidOf = capture({
  pattern: /m_Shader: \{fileID: -?\d+, guid: (?<guid>[0-9a-f]{32})/u,
  name: "guid",
});

const shaderNameOf = capture({ pattern: /Shader\s+"(?<name>[^"]+)"/u, name: "name" });

const markerOf = (material: string): Option.Option<string> =>
  pipe(
    SHADER_MARKERS,
    Array.findFirst(({ marker }) => pipe(material, String.includes(marker))),
    Option.map(({ name }) => name),
  );

const shaderOfMaterial =
  (shaders: HashMap.HashMap<string, string>) =>
  (material: string): Option.Option<string> =>
    pipe(
      shaderGuidOf(material),
      Option.flatMap((guid) =>
        pipe(
          HashMap.get(shaders, guid),
          Option.orElse(() =>
            Option.liftPredicate("Standard", () => guid === STANDARD_SHADER_GUID),
          ),
        ),
      ),
      Option.orElse(() => markerOf(material)),
    );

const shaderEntry = (entry: PackageEntry): Option.Option<readonly [string, string]> =>
  pipe(
    textOf(entry),
    Option.flatMap(shaderNameOf),
    Option.map((name) => [entry.guid, name] as const),
  );

const ofKind =
  (kind: AssetKind) =>
  (entries: readonly PackageEntry[]): readonly PackageEntry[] =>
    pipe(
      entries,
      Array.filter(({ pathname }) => kindOf(pathname) === kind),
    );

const countKinds = (entries: readonly PackageEntry[]): Readonly<Record<string, number>> =>
  pipe(
    entries,
    Array.groupBy(({ pathname }): string => kindOf(pathname)),
    Record.map(Array.length),
  );

const shadersOf = (entries: readonly PackageEntry[]): readonly string[] => {
  const shaders = HashMap.fromIterable(
    pipe(entries, ofKind("shader"), Array.map(shaderEntry), Array.getSomes),
  );
  return pipe(
    entries,
    ofKind("material"),
    Array.map(textOf),
    Array.getSomes,
    Array.map(shaderOfMaterial(shaders)),
    Array.getSomes,
    Array.dedupe,
    Array.sortWith((name) => name, Order.String),
  );
};

const pathsOf = (entries: readonly PackageEntry[]): string =>
  pipe(
    entries,
    Array.map(({ pathname }) => pathname),
    Array.join("\n"),
  );

const summarize = ({
  name,
  entries,
}: {
  readonly name: string;
  readonly entries: readonly PackageEntry[];
}): PackageSummary => ({
  counts: countKinds(entries),
  shaders: shadersOf(entries),
  avatars: avatarsIn(`${name}\n${pathsOf(entries)}`),
  colors: colorsIn(pathsOf(ofKind("material")(entries))),
});

export { summarize };
export type { PackageSummary };
