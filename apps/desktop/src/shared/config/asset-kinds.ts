import type { AssetKind } from "protocol";

type Kind = typeof AssetKind.Type;

const KIND_LABELS: Readonly<Record<Kind, string>> = {
  texture: "テクスチャ",
  model: "3D モデル",
  material: "マテリアル",
  prefab: "プレハブ",
  shader: "シェーダー",
  animation: "アニメーション",
  audio: "オーディオ",
  scene: "シーン",
  script: "スクリプト",
  other: "その他",
};

const SEARCHABLE_KINDS: readonly Kind[] = [
  "texture",
  "model",
  "material",
  "prefab",
  "shader",
  "animation",
  "audio",
  "scene",
  "script",
];

export { KIND_LABELS, SEARCHABLE_KINDS };
