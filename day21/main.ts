import { ControlOptionsList } from "./controlOptionsList.ts";
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

function findBestSequencesToUse(solutions: string[], arrowPad: Pad): string {
  let minDistSquared = Number.MAX_SAFE_INTEGER;
  let solutionInputs = solutions;

  for (let i = 0; i < solutionInputs.length; i++) {
    const costSquared = distCostSquared(solutionInputs[i], arrowPad);
    minDistSquared = Math.min(costSquared, minDistSquared);
  }

  solutionInputs = solutionInputs.filter((s) =>
    distCostSquared(s, arrowPad) === minDistSquared
  );

  // Take the first input with minimum distCostSquared. Apparently the others give the same result (or so it seems)
  return solutionInputs[0];
}

function getNextSliceIndex(input: string, minPartSize: number): number {
  if (input.length <= minPartSize) {
    return input.length;
  }

  const partAfterMinSize = input.slice(minPartSize);
  const indexOfA = partAfterMinSize.indexOf("A");

  if (indexOfA === -1) {
    return input.length;
  }

  return minPartSize + indexOfA + 1; // Include the A
}

function cutInPartsEndingOnA(input: string): string[] {
  const minPartSize = 500;
  const parts: string[] = [];
  let remaining = input;

  let nextSliceIndex = getNextSliceIndex(remaining, minPartSize);

  while (remaining.length > 0) {
    const nextPart = remaining.slice(0, nextSliceIndex);
    remaining = remaining.slice(nextSliceIndex);
    parts.push(nextPart);

    nextSliceIndex = getNextSliceIndex(remaining, minPartSize);
  }

  console.log(` > Cutting into ${parts.length} parts`);
  return parts;
}

function processInputInParts(input: string, arrowPad: Pad): string {
  const parts = cutInPartsEndingOnA(input);

  const partialResults: string[] = [];

  for (const part of parts) {
    const options = sequenceToType(
      part,
      arrowPad,
      true,
    );

    partialResults.push(options.toStringsOptimized());
  }

  return partialResults.join("");
}

function calcArrowPadBestSolution(
  inputs: string[],
  numRobots: number,
  arrowPad: Pad,
): string {
  let outcomes: string[] = [];
  let inputForRobot = inputs;

  for (let robot = 1; robot <= numRobots; robot++) {
    outcomes = [];

    for (const input of inputForRobot) {
      const resultSequence = processInputInParts(input, arrowPad);
      outcomes.push(resultSequence);
    }

    outcomes = [findBestSequencesToUse(outcomes, arrowPad)];

    inputForRobot = outcomes;
  }

  return outcomes[0];
}

function calcBestSequence(
  input: string,
  numRobots: number,
  numPad: Pad,
  arrowPad: Pad,
): number {
  const numPadOptions = sequenceToType(input, numPad, false);

  const numPadInputs = numPadOptions.toStrings();
  const solution = calcArrowPadBestSolution(numPadInputs, numRobots, arrowPad);

  const inputNum = parseInt(
    input.split("").filter((c) => c >= "0" && c <= "9").join(""),
  );
  const outcome = inputNum * solution.length;
  console.log(`${solution.length} x ${inputNum} = ${outcome}`);

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

if (import.meta.main) {
  const numPadText = await Deno.readTextFile("numpad");
  const numPadLines = numPadText.split("\n");

  const arrowPadText = await Deno.readTextFile("arrowpad");
  const arrowPadLines = arrowPadText.split("\n");

  const inputText = await Deno.readTextFile("input");
  const inputLines = inputText.split("\n");

  const numPad = new Pad(numPadLines);
  const arrowPad = new Pad(arrowPadLines);

  let sum = 0;

  for (const input of inputLines) {
    sum += calcBestSequence(input, 18, numPad, arrowPad);
  }
  // <vA<AA>>^AvAA^<A>Av<<A>A^>Av<<A>>^AvAA^<A>A
  // <vA<AA>>^AvAA^<A>Av<<A>A + ^>Av<<A>>^AvAA^<A>A
  // let solutions = calcArrowPadSolutions(["^>Av<<A>>^AvAA^<A>A"], 1, arrowPad);
  // const shortestLength = lengthShortest(solutions);
  // const unfilteredLength = solutions.length;
  // // solutions = solutions.filter(s => s.length === shortestLength).toSorted();
  // const filteredLength = solutions.length;

  // console.log(solutions.map(s => `${s}`).join("\n"));
  // console.log(`Shortest length ` + shortestLength);
  // // console.log(`Remaining ${filteredLength} of ${unfilteredLength}`);

  console.log(sum);
}

// Part 1: 238078
