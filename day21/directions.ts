import { Pad } from "./pad.ts";

export type ArrowKey = "^" | "v" | "<" | ">" | "A";

export class Directions {
  from: string;
  to: string;
  numLeft: number;
  numRight: number;
  numUp: number;
  numDown: number;
  validControlOptions: ArrowKey[][];

  constructor(
    from: string,
    to: string,
    numLeft: number,
    numRight: number,
    numUp: number,
    numDown: number,
    padSimulator: Pad,
  ) {
    this.from = from;
    this.to = to;
    this.numLeft = numLeft;
    this.numRight = numRight;
    this.numUp = numUp;
    this.numDown = numDown;

    this.validControlOptions = this.#getValidControlsPermutations(padSimulator);
  }

  #getValidControlsPermutations(padSimulator: Pad): ArrowKey[][] {
    const allControlsPermutations = this.#getControlsPermutations();

    const validControlsPermutations: ArrowKey[][] = [];

    for (const controlsList of allControlsPermutations) {
      const path = padSimulator.simulatePath(this.from, controlsList);
      if (!path.some((step) => step === "X")) {
        validControlsPermutations.push(controlsList);
      }
    }

    return validControlsPermutations;
  }

  // Also returns permutations passing the empty gap on the num pad, needs to be filtered out after
  #getControlsPermutations(): ArrowKey[][] {
    const controlsLists = this.#getControlsTuple();
    const nonZeroLists = controlsLists.filter((l) => l.length > 0);
    const nonZeroCount = nonZeroLists.length;

    if (nonZeroCount === 0) {
      return [];
    }

    if (nonZeroCount === 1) {
      return nonZeroLists;
    }

    if (nonZeroCount === 2) {
      const [firstList, secondList] = nonZeroLists;

      const [as, bs] = firstList.length >= secondList.length
        ? [firstList, secondList]
        : [secondList, firstList];

      const a = as[0];
      const b = bs[0];

      if (as.length === 1) { // bs.length is also 1
        return [[a, b], [b, a]];
      }

      if (as.length === 2 && bs.length === 1) {
        return [
          [a, a, b],
          [a, b, a],
          [b, a, a],
        ];
      }

      if (as.length === 2 && bs.length === 2) {
        return [
          [a, a, b, b],
          [a, b, a, b],
          [b, a, a, b],
          [b, a, b, a],
          [b, b, a, a],
        ];
      }

      if (as.length === 3 && bs.length === 1) {
        return [
          [a, a, a, b],
          [a, a, b, a],
          [a, b, a, a],
          [b, a, a, a],
        ];
      }

      if (as.length === 3 && bs.length === 2) {
        return [
          [a, a, a, b, b],
          [a, a, b, a, b],
          [a, b, a, a, b],
          [b, a, a, a, b],
          [a, a, b, b, a],
          [a, b, a, b, a],
          [b, a, a, b, a],
          [a, b, b, a, a],
          [b, a, b, a, a],
          [b, b, a, a, a],
        ];
      }
    }

    throw new Error(
      `Cannot handle this case of ${nonZeroCount} non-zero directions`,
    );
  }

  #getControlsTuple(): [ArrowKey[], ArrowKey[], ArrowKey[], ArrowKey[]] {
    return [
      Array(this.numLeft).fill("<"),
      Array(this.numRight).fill(">"),
      Array(this.numUp).fill("^"),
      Array(this.numDown).fill("v"),
    ];
  }

  static fromStartEnd(from: string, to: string, padSimulator: Pad): Directions {
    const fromPos = padSimulator.posMap.get(from);
    const toPos = padSimulator.posMap.get(to);

    if (fromPos === undefined || toPos === undefined) {
      throw new Error(`fromStartEnd received invalid from/to`);
    }

    const start = fromPos;
    const end = toPos;

    const numLeft = Math.max(start.x - end.x, 0);
    const numRight = Math.max(end.x - start.x, 0);
    const numUp = Math.max(start.y - end.y, 0);
    const numDown = Math.max(end.y - start.y, 0);

    return new Directions(
      from,
      to,
      numLeft,
      numRight,
      numUp,
      numDown,
      padSimulator,
    );
  }
}
