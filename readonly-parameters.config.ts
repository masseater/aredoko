import type { OxlintConfig } from "vite-plus/lint";

type ReadonlyParameterRule = NonNullable<
  NonNullable<OxlintConfig["rules"]>["typescript/prefer-readonly-parameter-types"]
>;

const readonlyParameterRule: ReadonlyParameterRule = [
  "error",
  {
    ignoreInferredTypes: true,
    allow: [
      {
        from: "lib",
        name: [
          "Request",
          "Uint8Array",
          "RegExp",
          "RegExpExecArray",
          "RegExpMatchArray",
          "HTMLCanvasElement",
        ],
      },
      { from: "package", package: "modern-tar", name: "ParsedTarEntry" },
      { from: "package", package: "@zip.js/zip.js", name: ["Entry", "FileEntry"] },
      { from: "package", package: "@tanstack/query-core", name: "QueryClient" },
      {
        from: "package",
        package: "react",
        name: [
          "ReactNode",
          "ButtonHTMLAttributes",
          "ClassAttributes",
          "ChangeEvent",
          "SubmitEvent",
        ],
      },
      { from: "package", package: "clsx", name: "ClassValue" },
      {
        from: "package",
        package: "three",
        name: [
          "LoadingManager",
          "Object3D",
          "WebGLRenderer",
          "PerspectiveCamera",
          "Scene",
          "Sphere",
          "BufferAttribute",
          "Material",
          "Mesh",
        ],
      },
      {
        from: "package",
        package: "@huggingface/transformers",
        name: ["RawImage", "PretrainedConfig", "PreTrainedModel", "Processor"],
      },
      {
        from: "package",
        package: "effect",
        name: [
          "Cause",
          "Context",
          "Effect",
          "Exit",
          "HashMap",
          "HashSet",
          "Layer",
          "Option",
          "Stream",
        ],
      },
    ],
  },
];

export { readonlyParameterRule };
export type { ReadonlyParameterRule };
