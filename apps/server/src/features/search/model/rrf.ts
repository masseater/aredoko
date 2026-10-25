import { Array, Number, Option, Order, pipe } from "effect";

const RRF_K = 60;
const FIRST_RANK = 1;
const WEIGHT = 1;
const NO_SCORE = 0;

const contribution =
  (id: number) =>
  (ranking: readonly number[]): number =>
    pipe(
      Array.findFirstIndex(ranking, (candidate) => candidate === id),
      Option.map((rank) => WEIGHT / (RRF_K + rank + FIRST_RANK)),
      Option.getOrElse(() => NO_SCORE),
    );

const scoreOf =
  (rankings: readonly (readonly number[])[]) =>
  (id: number): readonly [id: number, score: number] => {
    const contributions = pipe(rankings, Array.map(contribution(id)));
    return [id, Number.sumAll(contributions)];
  };

const fuse = (
  rankings: readonly (readonly number[])[],
): readonly (readonly [id: number, score: number])[] =>
  pipe(
    rankings,
    Array.flatten,
    Array.dedupe,
    Array.map(scoreOf(rankings)),
    Array.sortWith(([, score]) => score, Order.flip(Order.Number)),
  );

export { fuse };
