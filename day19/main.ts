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

  hasMatch(nextTowel: string): boolean {
    return this.remainingDesign.length >= nextTowel.length &&
      this.remainingDesign.startsWith(nextTowel);
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

  let solvableDesigns = 0;

  for (const design of designs) {
    const solution = findSolution(design, towelMap);

    if (solution !== undefined) {
      solvableDesigns += 1;
    }
  }

  console.log(`${towels.length} towels and ${designs.length} designs.`);

  console.log(solvableDesigns);
}

function findSolution(
  design: string,
  towelMap: Map<string, string[]>,
): PartialSolution | undefined {
  if (design === "") {
    throw new Error("Empty design");
  }

  return [];
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
