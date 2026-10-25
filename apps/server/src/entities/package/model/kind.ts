import { Array, Option, Record, String, pipe } from "effect";

import { capture } from "#shared/text";

const EXTENSIONS = {
  texture: ["png", "jpg", "jpeg", "tga", "psd", "tif", "tiff", "bmp", "exr", "hdr", "gif"],
  model: ["fbx", "obj", "blend", "dae", "3ds", "glb", "gltf", "vrm"],
  material: ["mat"],
  prefab: ["prefab"],
  shader: ["shader", "cginc", "hlsl", "shadergraph", "compute"],
  animation: ["anim", "controller", "overridecontroller", "mask"],
  audio: ["wav", "mp3", "ogg", "flac", "aif", "aiff"],
  scene: ["unity"],
  script: ["cs", "asmdef", "dll"],
} as const;

type AssetKind = keyof typeof EXTENSIONS | "other";

const extensionOf = capture({ pattern: /\.(?<extension>[^./]+)$/u, name: "extension" });

const kindOf = (pathname: string): AssetKind =>
  pipe(
    extensionOf(pathname),
    Option.map(String.toLowerCase),
    Option.flatMap((extension) =>
      pipe(
        Record.toEntries(EXTENSIONS),
        Array.findFirst(([, extensions]) => pipe(extensions, Array.contains(extension))),
      ),
    ),
    Option.match({ onNone: (): AssetKind => "other", onSome: ([kind]) => kind }),
  );

export { kindOf };
export type { AssetKind };
