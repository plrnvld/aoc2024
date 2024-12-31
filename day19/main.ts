type Match = "full" | "start" | "no";

class PartialSolution {
  design: string;
  index: number;

  constructor(design: string, index: number) {
    this.design = design;
    this.index = index;
  }

  nextSolution(nextTowel: string): PartialSolution {
    if (!this.design.slice(this.index).startsWith(nextTowel)) {
      throw new Error(
        `Invalid next towel '${nextTowel}' for remaining '${
          this.design.slice(this.index)
        }'`,
      );
    }

    return new PartialSolution(
      this.design,
      this.index + nextTowel.length,
    );
  }

  hasMatch(nextTowel: string): Match {
    if (this.design.length - this.index < nextTowel.length) {
      return "no";
    }

    const remainingDesign = this.design.slice(this.index);

    if (
      this.design.length - this.index === nextTowel.length &&
      nextTowel === remainingDesign
    ) {
      return "full";
    }

    return remainingDesign.startsWith(nextTowel) ? "start" : "no";
  }

  get isSolved(): boolean {
    return this.index >= this.design.length;
  }
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const parts = text.split("\n\n");

  const towels = parts[0].split(", ");
  const designs = parts[1].split("\n");
  const maxKeyLength = 5;
  const towelMap = buildTowelMap(towels, maxKeyLength);

  const sortedTowels = towels.sort((x, y) => x.length - y.length);
  const minTowelLength = sortedTowels.at(0)!.length;
  const maxTowelLength = sortedTowels.at(-1)!.length;

  console.log(
    `Min towel length = ${minTowelLength}, max towel length = ${maxTowelLength}`,
  );
  console.log("Map size = " + towelMap.size);

  const endGameMap = buildEndGameMap(towelMap);

  console.log("End game map calculated with size " + endGameMap.size);

  let solutionCount = 0;
  let i = 0;

  for (const design of designs) {
    console.log(i + ") Solving '" + design + "'");
    const solutions = findSolutions(design, towelMap, maxKeyLength);

    console.log(`  ==> ${solutions} solutions found.`);

    solutionCount += solutions;
    i += 1;
  }

  console.log(`${towels.length} towels and ${designs.length} designs.`);

  console.log(solutionCount);
}

function buildEndGameMap(towelMap: Map<string, string[]>): Map<string, number> {
  const map: Map<string, number> = new Map();
  const maxKeyLength = 8;

  const possibleKeys: string[] = [];

  const keyStack: string[] = [""];

  while (keyStack.length > 0) {
    const curr = keyStack.pop()!;

    if (curr !== "") {
      possibleKeys.push(curr);
    }

    if (curr.length < maxKeyLength) {
      keyStack.push(curr + "w");
      keyStack.push(curr + "u");
      keyStack.push(curr + "b");
      keyStack.push(curr + "r");
      keyStack.push(curr + "g");
    }
  }

  for (const key of possibleKeys) {
    const numSolutions = findSolutions(key, towelMap, 1);
    map.set(key, numSolutions);
  }

  return map;
}

function findSolutions(
  design: string,
  towelMap: Map<string, string[]>,
  maxKeyLength: number,
): number {
  if (design === "") {
    throw new Error("Empty design");
  }

  const stack: PartialSolution[] = [new PartialSolution(design, 0)];

  let solutionCount = 0;

  while (stack.length > 0) {
    const curr = stack.pop()!;
    const remainingDesignLength = curr.design.length - curr.index;
    const keyLength = Math.min(remainingDesignLength, maxKeyLength);
    const key = curr.design.slice(curr.index, curr.index + keyLength)!;
    const towelOptions = towelMap.get(key) ?? [];

    for (const towelOption of towelOptions) {
      const match = curr.hasMatch(towelOption);
      if (match === "full") {
        solutionCount += 1;

        if (solutionCount % 10000000 === 0) {
          console.log("  --> " + solutionCount / 1000000 + " milion");
        }
      }

      if (match === "start") {
        stack.push(curr.nextSolution(towelOption));
      }
    }
  }

  return solutionCount;
}

function findSolutionsWithEndGame(
  design: string,
  towelMap: Map<string, string[]>,
  maxKeyLength: number,
  endGameMap: Map<string, number>,
): number {
  if (design === "") {
    throw new Error("Empty design");
  }

  const stack: PartialSolution[] = [new PartialSolution(design, 0)];

  let solutionCount = 0;

  while (stack.length > 0) {
    const curr = stack.pop()!;
    const remainingDesignLength = curr.design.length - curr.index;

    if (remainingDesignLength <= 8) {
      const endGameResult = endGameMap.get(curr.design.slice(curr.index));
      if (endGameResult === undefined) {
        throw new Error(
          `Key ${curr.design.slice(curr.index)} not found in end game map`,
        );
      }

      solutionCount += endGameResult!;
    } else {
      const keyLength = Math.min(remainingDesignLength, maxKeyLength);
      const key = curr.design.slice(curr.index, curr.index + keyLength)!;
      const towelOptions = towelMap.get(key) ?? [];

      for (const towelOption of towelOptions) {
        const match = curr.hasMatch(towelOption);
        if (match === "full") {
          solutionCount += 1;

          if (solutionCount % 10000000 === 0) {
            console.log("  --> " + solutionCount / 1000000 + " milion");
          }
        }

        if (match === "start") {
          stack.push(curr.nextSolution(towelOption));
        }
      }
    }
  }

  return solutionCount;
}

function buildTowelMap(
  towels: string[],
  maxKeySize: number,
): Map<string, string[]> {
  const map: Map<string, string[]> = new Map();

  const addValue = (key: string, value: string) => {
    const towelsWithKey = map.get(key);

    if (towelsWithKey === undefined) {
      map.set(key, [value]);
    } else {
      towelsWithKey.push(value);
      map.set(key, towelsWithKey);
    }
  };

  const expandKey = (towel: string, required: number) => {
    if (towel.length >= required) {
      return [towel.slice(0, required)];
    }

    const expandedKeys: string[] = [];

    const stack: string[] = [towel];

    while (stack.length > 0) {
      const curr = stack.pop()!;

      if (curr.length < required) {
        stack.push(curr + "w");
        stack.push(curr + "u");
        stack.push(curr + "b");
        stack.push(curr + "r");
        stack.push(curr + "g");
      } else {
        expandedKeys.push(curr);
      }
    }

    return expandedKeys;
  };

  for (let keyLength = 1; keyLength <= maxKeySize; keyLength++) {
    for (const towel of towels) {
      const keys = expandKey(towel, keyLength);

      keys.forEach((k) => addValue(k, towel));
    }
  }

  return map;
}
