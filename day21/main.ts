import { ControlOptionsList } from "./controlOptionsList.ts";
import { cutInPartsEndingOnA, SequencePart } from "./cutter.ts";
import { Pad } from "./pad.ts";

function sequenceToType(
  keys: string,
  pad: Pad,
  optimize: boolean,
): ControlOptionsList {
  const directionsList = new ControlOptionsList();

  const requiredKeys = "A" + keys;
  for (let i = 0; i < requiredKeys.length - 1; i++) {
    const pair = requiredKeys.slice(i, i + 2);

    const directionsOptions = pad.directionsMap.get(pair);
    if (directionsOptions === undefined) {
      throw new Error(`No valid options found for '${pair}'`);
    }

    const optionsToConsider = directionsOptions.validControlOptions;
    directionsList.push(optionsToConsider, pad, optimize);
  }

  return directionsList;
}

function processInputInParts(
  sequencePart: SequencePart,
  arrowPad: Pad,
): SequencePart {
  const level = sequencePart.robotLevel;
  const sequenceParts: SequencePart[] = cutInPartsEndingOnA(sequencePart, 0);

  const partialResults: string[] = [];

  for (const sequencePart of sequenceParts) {
    const options = sequenceToType(
      sequencePart.part,
      arrowPad,
      false,
    );

    partialResults.push(options.toStringsOptimized());
  }

  return new SequencePart(partialResults.join(""), level + 1, false);
}

function processInputInPartsUnoptimized(
  sequencePart: SequencePart,
  arrowPad: Pad,
): SequencePart[] {
  const level = sequencePart.robotLevel;

  const options = sequenceToType(
    sequencePart.part,
    arrowPad,
    false, // ######## Flipping this to false was the solution
  );

  return options.toStrings().map((r) => new SequencePart(r, level + 1, false));
}

function calcArrowPadBestSolution(
  input: string,
  numRobots: number,
  arrowPad: Pad,
  cache: SolutionNumsCache | null,
): number {
  if (numRobots === 0) {
    return input.length;
  }

  const firstLevelSequence = new SequencePart(input, 0, false);
  const outcome = processInputInParts(firstLevelSequence, arrowPad);

  // Process first level differently

  let sequenceLength = 0;

  const partsStack: SequencePart[] = [outcome];

  while (partsStack.length > 0) {
    const currSequence = partsStack.pop()!;

    if (
      cache !== null &&
      currSequence.robotLevel + cache.levelsCached === numRobots
    ) { // Solution should be in cache
      const cuts: SequencePart[] = cutInPartsEndingOnA(currSequence, 0); // Cut size 0, get all separate sequences ending in "A"

      for (const cut of cuts) {
        const cachedOutcome = cache.cacheMap.get(cut.part);
        if (cachedOutcome === undefined) {
          throw new Error(`Part ${cut.part} not in cache.`);
        }

        sequenceLength += cachedOutcome;
      }
    } else if (currSequence.robotLevel === numRobots) {
      sequenceLength += currSequence.part.length;
    } else if (!currSequence.isCut) {
      const cuts: SequencePart[] = cutInPartsEndingOnA(currSequence, 0);

      for (const cut of cuts) {
        partsStack.push(cut);
      }
    } else { // Part is already cut, level < numRobots
      const options = sequenceToType(
        currSequence.part,
        arrowPad,
        true,
      );

      const nextPart = new SequencePart(
        options.toStringsOptimized(),
        currSequence.robotLevel + 1,
        false,
      );
      partsStack.push(nextPart);
    }
  }

  return sequenceLength;
}

function calcArrowPadBestSolutionOneLevelUsingCache(
  input: string,
  arrowPad: Pad,
  cache: SolutionNumsCache,
): number {
  if (input === "A") {
    return 1;
  }

  const sequencePart = new SequencePart(input, cache.levelsCached, false);

  const resultSequences = processInputInPartsUnoptimized(
    sequencePart,
    arrowPad,
  );

  const results: number[] = [];

  for (const res of resultSequences) {
    let sequenceLength = 0;

    for (const cut of cutInPartsEndingOnA(res, 0)) {
      sequenceLength += cache.cacheMap.get(cut.part)!;
    }

    results.push(sequenceLength);
  }

  return Math.min(...results);
}

export function distCostSquared(solution: string, pad: Pad): number {
  let costSquared = 0;

  for (let i = 0; i < solution.length - 1; i++) {
    const pair = solution.slice(i, i + 2);
    const directions = pad.directionsMap.get(pair)!;
    costSquared += directions.distSquared;
  }

  return costSquared;
}

class SolutionNumsCache {
  cacheMap: Map<string, number>;
  levelsCached: number;

  constructor(cacheMap: Map<string, number>, levelsCached: number) {
    this.cacheMap = cacheMap;
    this.levelsCached = levelsCached;
  }
}

function buildSolutionNumCache(
  arrowPad: Pad,
  levelsToCache: number,
): SolutionNumsCache {
  // Create set with all routes
  const allRoutes: Set<string> = new Set();
  allRoutes.add("A");

  for (const [_, dir] of arrowPad.directionsMap) {
    const validOptions = dir.validControlOptions;

    for (const validOption of validOptions) {
      const validOptionString = validOption.map((c) => c as string).join("") +
        "A";
      allRoutes.add(validOptionString);
    }
  }

  // Calculate values for the required number of levels
  const mapWithSolutionNums: Map<string, number> = new Map();
  for (const item of allRoutes) {
    const numSolutions = calcArrowPadBestSolution(
      item,
      levelsToCache,
      arrowPad,
      null,
    );
    mapWithSolutionNums.set(item, numSolutions);
  }

  console.log("Cache created.");
  return new SolutionNumsCache(mapWithSolutionNums, levelsToCache);
}

function takeCacheToTheNextLevel(
  cache: SolutionNumsCache,
  arrowPad: Pad,
): SolutionNumsCache {
  const nextLevel = cache.levelsCached + 1;
  const allRoutes = cache.cacheMap.keys();

  // Calculate values for the required number of levels
  const mapWithSolutionNums: Map<string, number> = new Map();
  for (const item of allRoutes) {
    const numSolutions = calcArrowPadBestSolutionOneLevelUsingCache(
      item,
      arrowPad,
      cache,
    );

    mapWithSolutionNums.set(item, numSolutions);
  }

  return new SolutionNumsCache(mapWithSolutionNums, nextLevel);
}

if (import.meta.main) {
  const numPadText = await Deno.readTextFile("numpad");
  const numPadLines = numPadText.split("\n");

  const arrowPadText = await Deno.readTextFile("arrowpad");
  const arrowPadLines = arrowPadText.split("\n");

  const inputText = await Deno.readTextFile("input");
  const inputLines = inputText.split("\n");

  const numPad = new Pad(numPadLines);
  const arrowPad = new Pad(arrowPadLines);

  let cache = buildSolutionNumCache(arrowPad, 0);

  while (cache.levelsCached < 24) {
    cache = takeCacheToTheNextLevel(cache, arrowPad);
  }

  for (const [key, val] of cache.cacheMap) {
    console.log(`  [${key}] => ${val}`);
  }

  let sum = 0;

  for (const input of inputLines) {
    const inputNum = parseInt(
      input.split("").filter((c) => c >= "0" && c <= "9").join(""),
    );

    console.log(`\nCalculating for input '${input}'\n`);

    const numPadOptions = sequenceToType(input, numPad, false);
    const arrowPadInputs = numPadOptions.toStrings();

    const outcomes: number[] = [];

    for (const arrowPadInput of arrowPadInputs) {
      console.log(`${arrowPadInput}`);

      const res = calcArrowPadBestSolutionOneLevelUsingCache(
        arrowPadInput,
        arrowPad,
        cache,
      );
      outcomes.push(res);
      console.log(` - ${res} `);
    }

    const best = Math.min(...outcomes);
    console.log();
    console.log(`Best: ${inputNum} * ${best} = ${inputNum * best}`);
    console.log();

    sum += inputNum * best;
  }

  console.log(sum);
  console.log(sum.toString().length + " digits");
}

// Part 1: 238078

// Part 2:
// 383076814233 too low
// 958909626187 too low
// 335879439503508 too high
// 837071681292442
// 334401993564198 not the right answer
// 1233528198424 not the right answer
// 3087755478336

// ** 293919502998014 ** Found it!

// For only 2 levels
// 70 x 638 = 44660
// 66 x 965 = 63690
// 66 x 780 = 51480
// 76 x 803 = 61028
// 70 x 246 = 17220
// 238078
