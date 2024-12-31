type Match = "full" | "start" | "no";

const towelPartition = 8;

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
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const parts = text.split("\n\n");

  const towels = parts[0].split(", ");
  const designs = parts[1].split("\n");

  const towelSet: Set<string> = new Set();
  towels.forEach((t) => towelSet.add(t));

  const towelMap = buildTowelMap(towels);

  const endGameMap = buildEndGameMap(towelMap);

  console.log("End game map calculated with size " + endGameMap.size);

  let solutionCount = 0n;
  let i = 0;

  for (const design of designs) {
    console.log(i + ") Solving '" + design + "'");
    const solutions = dynamicProgramSolutions(design, endGameMap, towelSet);

    console.log(`  ==> ${solutions} solutions found.`);

    solutionCount += solutions;
    i += 1;
  }

  console.log(`${towels.length} towels and ${designs.length} designs.`);

  console.log(solutionCount);
}

function buildEndGameMap(towelMap: Map<string, string[]>): Map<string, number> {
  const map: Map<string, number> = new Map();

  const possibleKeys: string[] = [];

  const keyStack: string[] = [""];

  while (keyStack.length > 0) {
    const curr = keyStack.pop()!;

    if (curr !== "") {
      possibleKeys.push(curr);
    }

    if (curr.length < towelPartition) {
      keyStack.push(curr + "w");
      keyStack.push(curr + "u");
      keyStack.push(curr + "b");
      keyStack.push(curr + "r");
      keyStack.push(curr + "g");
    }
  }

  for (const key of possibleKeys) {
    const numSolutions = findSolutions(key, towelMap);
    map.set(key, numSolutions);
  }

  return map;
}

function dynamicProgramSolutions(
  design: string,
  endGameMap: Map<string, number>,
  towelSet: Set<string>,
): bigint {
  const solutions: bigint[] = new Array(design.length);
  const lastIndex = solutions.length - 1;

  for (let n = 0; n < design.length; n++) {
    const i = lastIndex - n;

    if (n < 8) {
      solutions[i] = BigInt(endGameMap.get(design.slice(i))!);
    } else {
      let combinedSolutions = 0n;

      for (let j = 1; j <= 8; j++) {
        const slice = design.slice(i, i + j);

        if (towelSet.has(slice)) {
          combinedSolutions += solutions[i + j];
        }
      }

      solutions[i] = combinedSolutions;
    }
  }

  console.log(solutions);

  return solutions[0];
}

function findSolutions(
  design: string,
  towelMap: Map<string, string[]>
): number {
  if (design === "") {
    throw new Error("Empty design");
  }

  const stack: PartialSolution[] = [new PartialSolution(design, 0)];

  let solutionCount = 0;

  while (stack.length > 0) {
    const curr = stack.pop()!;
    const key = curr.design.slice(curr.index, curr.index + 1)!;
    const towelOptions = towelMap.get(key) ?? [];

    for (const towelOption of towelOptions) {
      const match = curr.hasMatch(towelOption);
      if (match === "full") {
        solutionCount += 1;
      }

      if (match === "start") {
        stack.push(curr.nextSolution(towelOption));
      }
    }
  }

  return solutionCount;
}

function buildTowelMap(
  towels: string[],
): Map<string, string[]> {
  const map: Map<string, string[]> = new Map();

  for (const towel of towels) {
    const key = towel[0];

    const towelsWithKey = map.get(key);

    if (towelsWithKey === undefined) {
      map.set(key, [towel]);
    } else {
      towelsWithKey.push(towel);
      map.set(key, towelsWithKey);
    }
  }

  return map;
}

// 815870527308663722701965 too high
// 486554925696246595074450 too high
// 680190000280467 too low
// 681226908011510
