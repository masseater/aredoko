import { Array, String, pipe } from "effect";

import { wordsOf } from "./avatars.ts";

interface Alias {
  readonly name: string;
  readonly aliases: readonly string[];
}

const COLORS: readonly Alias[] = [
  { name: "黒", aliases: ["black", "blk", "黒"] },
  { name: "白", aliases: ["white", "wht", "白"] },
  { name: "赤", aliases: ["red", "赤"] },
  { name: "青", aliases: ["blue", "青"] },
  { name: "水色", aliases: ["cyan", "lightblue", "aqua", "水色"] },
  { name: "紺", aliases: ["navy", "紺"] },
  { name: "緑", aliases: ["green", "緑"] },
  { name: "黄", aliases: ["yellow", "黄"] },
  { name: "橙", aliases: ["orange", "橙"] },
  { name: "ピンク", aliases: ["pink", "ピンク"] },
  { name: "紫", aliases: ["purple", "violet", "紫"] },
  { name: "茶", aliases: ["brown", "茶"] },
  { name: "灰", aliases: ["gray", "grey", "灰"] },
  { name: "ベージュ", aliases: ["beige", "ベージュ"] },
  { name: "クリーム", aliases: ["cream", "クリーム"] },
  { name: "金", aliases: ["gold", "金"] },
  { name: "銀", aliases: ["silver", "銀"] },
];

const LATIN = /^[a-z]+$/u;

const mentions =
  (text: string, words: readonly string[]) =>
  (alias: string): boolean =>
    pipe(words, Array.contains(alias)) ||
    (!LATIN.test(alias) && pipe(text, String.includes(alias)));

const colorsIn = (text: string): readonly string[] => {
  const words = wordsOf(text);
  return pipe(
    COLORS,
    Array.filter(({ aliases }) => pipe(aliases, Array.some(mentions(text, words)))),
    Array.map(({ name }) => name),
  );
};

export { colorsIn };
