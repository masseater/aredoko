import { Array, String, pipe } from "effect";

interface Alias {
  readonly name: string;
  readonly aliases: readonly string[];
}

const AVATARS: readonly Alias[] = [
  { name: "桔梗", aliases: ["kikyo", "kikyou"] },
  { name: "セレスティア", aliases: ["selestia", "celestia"] },
  { name: "萌", aliases: ["moe"] },
  { name: "ラスク", aliases: ["rusk"] },
  { name: "マヌカ", aliases: ["manuka"] },
  { name: "舞夜", aliases: ["maya"] },
  { name: "森羅", aliases: ["shinra"] },
  { name: "カリン", aliases: ["karin"] },
  { name: "シフォン", aliases: ["chiffon"] },
  { name: "竜胆", aliases: ["rindo", "rindou"] },
  { name: "薄荷", aliases: ["hakka"] },
  { name: "ライム", aliases: ["lime"] },
  { name: "卯月", aliases: ["uzuki"] },
  { name: "ミルティナ", aliases: ["milltina", "miltina"] },
  { name: "リーファ", aliases: ["leefa"] },
  { name: "キプフェル", aliases: ["kipfel"] },
  { name: "瑞希", aliases: ["mizuki"] },
  { name: "愛莉", aliases: ["airi"] },
  { name: "ソフィナ", aliases: ["sophina"] },
  { name: "ショコラ", aliases: ["chocolat"] },
  { name: "ルルネ", aliases: ["rurune"] },
  { name: "しなの", aliases: ["shinano"] },
  { name: "まめひなた", aliases: ["mamehinata"] },
  { name: "ウルフェリア", aliases: ["wolferia"] },
  { name: "ラシューシャ", aliases: ["lasyusha"] },
  { name: "イメリス", aliases: ["imeris"] },
  { name: "ミーシェ", aliases: ["mishe"] },
  { name: "くろなつ", aliases: ["kuronatu", "kuronatsu"] },
];

const wordsOf = (text: string): readonly string[] =>
  pipe(
    text,
    String.replaceAll(/(?<lower>\p{Ll})(?<upper>\p{Lu})/gu, "$<lower> $<upper>"),
    String.toLowerCase,
    String.split(/[^\p{L}\p{N}]+/u),
    Array.filter(String.isNonEmpty),
  );

const avatarsIn = (text: string): readonly string[] => {
  const words = wordsOf(text);
  return pipe(
    AVATARS,
    Array.filter(
      ({ name, aliases }) =>
        pipe(text, String.includes(name)) ||
        pipe(
          aliases,
          Array.some((alias) => pipe(words, Array.contains(alias))),
        ),
    ),
    Array.map(({ name }) => name),
  );
};

export { avatarsIn, wordsOf };
