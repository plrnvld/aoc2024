type Match = "full" | "start" | "no";

class PartialSolution {
  towels: string[] = [];
  remainingDesign: string;

  constructor(design: string, towels: string[]) {
    this.towels = towels;
    this.remainingDesign = design;
  }

  nextSolution(nextTowel: string): PartialSolution {
    if (!this.remainingDesign.startsWith(nextTowel)) {
      throw new Error(
        `Invalid next towel '${nextTowel}' for remaining '${this.remainingDesign}'`,
      );
    }

    return new PartialSolution(
      this.remainingDesign.slice(nextTowel.length),
      this.towels.concat([nextTowel]),
    );
  }

  hasMatch(nextTowel: string): Match {
    if (this.remainingDesign.length < nextTowel.length)
      return "no";

    if (this.remainingDesign.length === nextTowel.length && nextTowel === this.remainingDesign)
      return "full";
    
    return this.remainingDesign.startsWith(nextTowel) ? "start" : "no";
  }

  get isSolved(): boolean {
    return this.remainingDesign === "";
  }
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const parts = text.split("\n\n");

  const towels = parts[0].split(", ");
  const designs = parts[1].split("\n");
  const towelMap = buildTowelMap(towels);

  let solutionCount = 0;

  for (const design of designs) {
    console.log("Trying to solve design " + design);
    const solutions = findSolution(design, towelMap);

    solutionCount += solutions.length;
  }

  console.log(`${towels.length} towels and ${designs.length} designs.`);

  console.log(solutionCount);
}

function findSolution(
  design: string,
  towelMap: Map<string, string[]>,
): PartialSolution[] {
  if (design === "") {
    throw new Error("Empty design");
  }

  const stack: PartialSolution[] = [new PartialSolution(design, [])];

  const solutions: PartialSolution[] = [];

  while (stack.length > 0) {
    const curr = stack.pop()!;
    const key = curr?.remainingDesign[0]!;
    const towelOptions = towelMap.get(key) ?? [];

    // console.log(` > Remaining ${curr.remainingDesign} has options ${towelOptions.join(",")}`);

    for (const towelOption of towelOptions) {
      const match = curr.hasMatch(towelOption);
      if (match === "full") {
        // console.log(`   > Full match with ${towelOption}`);
        solutions.push(curr.nextSolution(towelOption));
      }

      if (match === "start") {
        // console.log(`   > Start match with ${towelOption}`);
        stack.push(curr.nextSolution(towelOption));
      }
    }
  }

  return solutions;
}

function buildTowelMap(towels: string[]): Map<string, string[]> {
  const map: Map<string, string[]> = new Map();

  for (const towel of towels) {
    const key = towel[0]!;

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
