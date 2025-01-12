import { ControlOptionsList } from "./controlOptionsList.ts";
import { Pad } from "./pad.ts";

function sequenceToType(
  keys: string,
  pad: Pad,
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
    directionsList.push(optionsToConsider);
  }

  return directionsList;
}

function lengthShortest(texts: string[]): number {
  let res = texts[0].length;

  for (let i = 1; i < texts.length; i++) {
    res = Math.min(res, texts[i].length);
  }

  return res;
}

function findBestSequencesToUse(solutions: string[], arrowPad: Pad): string[] {
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
  return solutionInputs.slice(0, 1);
}

function calcArrowPadSolutions(
  inputs: string[],
  numRobots: number,
  arrowPad: Pad,
): string[] {
  let solutions: string[] = [];
  let inputForRobot = inputs;

  for (let robot = 1; robot <= numRobots; robot++) {
    solutions = [];
    let minArrowChanges = Number.MAX_SAFE_INTEGER;

    for (const input of inputForRobot) {
      const options = sequenceToType(
        input,
        arrowPad,
      );

      for (
        const solution of findBestSequencesToUse(options.toStrings(), arrowPad)
      ) {
        const numArrowChanges = arrowChanges(solution);

        if (numArrowChanges <= minArrowChanges) {
          minArrowChanges = numArrowChanges;
          solutions.push(solution);
        }
      }
    }

    const unfilteredLength = solutions.length;
    solutions = findBestSequencesToUse(solutions, arrowPad);

    const filteredLength = solutions.length;

    console.log(` > Filtered ${filteredLength} of ${unfilteredLength}`);
    inputForRobot = solutions;
  }

  return solutions;
}

function calcBestSequence(
  input: string,
  numRobots: number,
  numPad: Pad,
  arrowPad: Pad,
): number {
  const numPadOptions = sequenceToType(input, numPad);

  const numPadInputs = numPadOptions.toStrings();
  const solutions = calcArrowPadSolutions(numPadInputs, numRobots, arrowPad);

  // console.log();
  // console.log("*****");

  // console.log(numPadSolutions.join("\n"));
  // console.log();
  // console.log();

  const shortest = lengthShortest(solutions);
  const inputNum = parseInt(
    input.split("").filter((c) => c >= "0" && c <= "9").join(""),
  );
  const outcome = inputNum * shortest;
  console.log(`${shortest} x ${inputNum} = ${outcome}`);

  return outcome;
}

function arrowChanges(solution: string): number {
  let changes = 0;

  let c = solution[0];

  for (let i = 1; i < solution.length; i++) {
    const newC = solution[i];

    if (newC !== c) {
      c = newC;
      changes += 1;
    }
  }

  return changes;
}

function distCostSquared(solution: string, pad: Pad): number {
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
    sum += calcBestSequence(input, 2, numPad, arrowPad);
  }
  // let solutions = calcArrowPadSolutions(["<vA<AA>>^AvAA^<A>Av<<A>A^>Av<<A>>^AvAA^<A>A"], 1, arrowPad);
  // const shortestLength = lengthShortest(solutions);
  // const unfilteredLength = solutions.length;
  // // solutions = solutions.filter(s => s.length === shortestLength).toSorted();
  // const filteredLength = solutions.length;

  // console.log(solutions.map(s => `${s} (${arrowChanges(s)}) [${distCostSquared(s, arrowPad)}]`).join("\n"));
  // console.log(`Shortest length ` + shortestLength);
  // // console.log(`Remaining ${filteredLength} of ${unfilteredLength}`);

  console.log(sum);
}

// Part 1: 238078
