import { ControlOptionsList } from "./controlOptionsList.ts";
import { Pad } from "./pad.ts";

function sequenceToType(keys: string, pad: Pad): ControlOptionsList {
  const directionsList = new ControlOptionsList();

  const requiredKeys = "A" + keys;
  for (let i = 0; i < requiredKeys.length - 1; i++) {
    const pair = requiredKeys.slice(i, i + 2);

    const directionsOptions = pad.directionsMap.get(pair);
    if (directionsOptions === undefined) {
      throw new Error(`No valid options found for '${pair}'`);
    }

    directionsList.push(directionsOptions.validControlOptions);
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

function calcNumPadSolutions(inputs: string[], numRobots: number, arrowPad: Pad): string[] {
  let solutions: string[] = [];
  let inputForRobot = inputs;

  for (let robot = 1; robot <= numRobots; robot++) {
    solutions = [];
    
    for (const input of inputForRobot) {
      const options = sequenceToType(
        input,
        arrowPad,
      );

      for (const result of options.toStrings()) {
        solutions.push(result);
      }
    }

    inputForRobot = solutions;
  }

  return solutions;
}

function calcBestSequence(input: string, numRobots: number, numPad: Pad, arrowPad: Pad): number {
  const numPadOptions = sequenceToType(input, numPad);

  const numPadInputs = numPadOptions.toStrings();
  const solutions = calcNumPadSolutions(numPadInputs, numRobots, arrowPad);
  
  // console.log();
  // console.log("*****");
  
  // console.log(numPadSolutions.join("\n"));
  // console.log();
  // console.log();

  const shortest = lengthShortest(solutions);
  const inputNum = parseInt(input.split("").filter(c => c >= '0' && c <= '9').join(""));
  const outcome = inputNum * shortest;
  console.log(`${shortest} x ${inputNum} = ${outcome}`);

  return outcome;
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

  for (const input of inputLines)
    sum += calcBestSequence(input, 2, numPad, arrowPad);
  // const solutions = calcNumPadSolutions(["^>"], 3, arrowPad);

  // console.log(solutions.join("\n"));
  // console.log(lengthShortest(solutions));
  // console.log(solutions.length);

  console.log(sum);
}
