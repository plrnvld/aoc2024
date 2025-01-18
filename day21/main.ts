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

function findBestSequencesToUse(sequenceParts: SequencePart[], arrowPad: Pad): SequencePart {
  let minDistSquared = Number.MAX_SAFE_INTEGER;
  let solutionInputs = sequenceParts;

  for (let i = 0; i < solutionInputs.length; i++) {
    const costSquared = distCostSquared(solutionInputs[i].part, arrowPad);
    minDistSquared = Math.min(costSquared, minDistSquared);
  }

  solutionInputs = solutionInputs.filter((s) =>
    distCostSquared(s.part, arrowPad) === minDistSquared
  );

  // Take the first input with minimum distCostSquared. Apparently the others give the same result (or so it seems)
  return solutionInputs[0];
}

function processInputInParts(sequencePart: SequencePart, arrowPad: Pad): SequencePart {
  const level = sequencePart.robotLevel;
  const sequenceParts: SequencePart[] = cutInPartsEndingOnA(sequencePart, 100);

  const partialResults: string[] = [];

  for (const sequencePart of sequenceParts) {
    const options = sequenceToType(
      sequencePart.part,
      arrowPad,
      true,
    );

    partialResults.push(options.toStringsOptimized());
  }

  return new SequencePart(partialResults.join(""), level + 1, false);
}

function calcArrowPadBestSolution(
  inputs: string[],
  numRobots: number,
  arrowPad: Pad,
  cache: SolutionNumsCache | null
): number {
  const firstLevelSequences = inputs.map(i => new SequencePart(i, 0, false));
  
  let outcomes: SequencePart[] = [];
  for (const sequencePart of firstLevelSequences) {
    const resultSequence = processInputInParts(sequencePart, arrowPad);
    outcomes.push(resultSequence);
  }

  outcomes = [findBestSequencesToUse(outcomes, arrowPad)];

  // Process first level differently

  const sequencePartsForRobot = outcomes;

  let sequenceLength = 0;

  const partsStack: SequencePart[] = sequencePartsForRobot;

  while (partsStack.length > 0) {
    const currSequence = partsStack.pop()!;
    
    if (cache !== null && currSequence.robotLevel + cache.levelsCached === numRobots) { // Solution should be in cache
      
      const cuts: SequencePart[] = cutInPartsEndingOnA(currSequence, 0); // Cut size 0, get all separate sequences ending in "A"
      
      for (const cut of cuts) {
        const cachedOutcome = cache.cacheMap.get(cut.part);
        if (cachedOutcome === undefined)
          throw new Error(`Part ${cut.part} not in cache.`);
        
        sequenceLength += cachedOutcome;
      }
    } else if (currSequence.robotLevel === numRobots) {
      sequenceLength += currSequence.part.length;
    } else if (!currSequence.isCut) {
      
      const cuts: SequencePart[] = cutInPartsEndingOnA(currSequence, 100);
      
      for (const cut of cuts) {
        partsStack.push(cut);
      }
    } else { // Part is already cut, level < numRobots
        const options = sequenceToType(
          currSequence.part,
          arrowPad,
          true,
        );
    
        const nextPart = new SequencePart(options.toStringsOptimized(), currSequence.robotLevel + 1, false);
        partsStack.push(nextPart);
      }
    }

    return sequenceLength;
  }

  function calcArrowPadBestSolutionOneLevelUsingCache(
    input: string,
    arrowPad: Pad,
    cache: SolutionNumsCache
  ): number {
    
    const numRobots = cache.levelsCached + 1;
    const sequencePart = new SequencePart(input, cache.levelsCached, false);
    
    const resultSequence = processInputInParts(sequencePart, arrowPad);
    
    let sequenceLength = 0;
  
    const partsStack: SequencePart[] = [];
    const cuts: SequencePart[] = cutInPartsEndingOnA(resultSequence, 0);
        
    for (const cut of cuts) {
      partsStack.push(cut);
    }

    while (partsStack.length > 0) {
      const currSequence = partsStack.pop()!;

      const cachedOutcome = cache.cacheMap.get(currSequence.part);
      if (cachedOutcome === undefined)
        throw new Error(`Part ${currSequence.part} not in cache.`);
      
      sequenceLength += cachedOutcome;
    }

    return sequenceLength;
  }
  
function calcBestSequence(
  input: string,
  numRobots: number,
  numPad: Pad,
  arrowPad: Pad,
  cache: SolutionNumsCache | null
): number {
  const numPadOptions = sequenceToType(input, numPad, false);

  const numPadInputs = numPadOptions.toStrings();
  const solutionLength = calcArrowPadBestSolution(numPadInputs, numRobots, arrowPad, cache);

  const inputNum = parseInt(
    input.split("").filter((c) => c >= "0" && c <= "9").join(""),
  );
  const outcome = inputNum * solutionLength;
  console.log(`${solutionLength} x ${inputNum} = ${outcome}`);

  return outcome;
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

function buildSolutionNumCache(arrowPad: Pad, levelsToCache: number): SolutionNumsCache {
  console.log(`Building level ${levelsToCache} arrowPad cache.`);

  // Create set with all routes
  const allRoutes: Set<string> = new Set();
  allRoutes.add("A");

  for (const [_, dir] of arrowPad.directionsMap) {
    const validOptions = dir.validControlOptions;

    for (const validOption of validOptions) {
      const validOptionString = validOption.map(c => c as string).join("") + "A";
      allRoutes.add(validOptionString);
    }    
  }

  // Calculate values for the required number of levels
  const mapWithSolutionNums: Map<string, number> = new Map();
  for (const item of allRoutes) {
    const numSolutions = calcArrowPadBestSolution([item], levelsToCache, arrowPad, null);
    mapWithSolutionNums.set(item, numSolutions);
  }

  console.log("Cache created.");
  return new SolutionNumsCache(mapWithSolutionNums, levelsToCache);
}

function takeCacheToTheNextLevel(cache: SolutionNumsCache, arrowPad: Pad): SolutionNumsCache {
  const nextLevel = cache.levelsCached + 1;
  console.log(`Building level ${nextLevel} cache.`);

  const allRoutes = cache.cacheMap.keys();

   // Calculate values for the required number of levels
   const mapWithSolutionNums: Map<string, number> = new Map();
   for (const item of allRoutes) {
     const numSolutions = calcArrowPadBestSolutionOneLevelUsingCache(item, arrowPad, cache);
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

  const preCache = buildSolutionNumCache(arrowPad, 1);
  let tempCache = takeCacheToTheNextLevel(preCache, arrowPad);
  
  while (tempCache.levelsCached < 15)
    tempCache = takeCacheToTheNextLevel(tempCache, arrowPad);

  const cache = tempCache;

  for (const [key, val] of cache.cacheMap) {
    console.log(`  [${key}] => ${val}`);
  }

  let sum = 0;

  // for (const input of inputLines) {
  //   sum += calcBestSequence(input, 25, numPad, arrowPad, cache);
  // }

  // for (const [key, dir] of arrowPad.directionsMap) {
  //   console.log(`> ${JSON.stringify(dir)}`);
  // }
  
  console.log(sum);
  console.log(sum.toString().length + " digits");

}

// Part 1: 238078

// Part 2: for 10 levels --> 
// 353796830 
//  37327494
// 233912128
// Part 2: 
// 383076814233 too low
// 958909626187 too low
// 335879439503508 too high
// 335879439503508

// For only 2 levels
// 70 x 638 = 44660
// 66 x 965 = 63690
// 66 x 780 = 51480
// 76 x 803 = 61028
// 70 x 246 = 17220
// 238078



//   [A] => 1
//   [>A] => 1685064
//   [v<A] => 3544745
//   [vA] => 2502876
//   [>vA] => 3233793
//   [v>A] => 2669135
//   [<A] => 2608204
//   [<v<A] => 4323192
//   [v<<A] => 3544746
//   [<vA] => 3281323
//   [>^A] => 2983775
//   [>>^A] => 2983776
//   [>^>A] => 4062168
//   [>>A] => 1685065
//   [^A] => 1714988
//   [^>A] => 2793381
//   [<^A] => 3281323
//   [^<A] => 3650071
//   [<<A] => 2608205
