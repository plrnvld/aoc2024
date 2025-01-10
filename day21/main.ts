import { ControlOptionsList } from "./controlOptionsList.ts";
import { Pad } from "./pad.ts";

function sequenceToTypePad(keys: string, pad: Pad): ControlOptionsList {
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

function calcBestSequence(input: string, numPad: Pad, arrowPad: Pad): number {
  const numPadOptions = sequenceToTypePad(input, numPad);

  const numPadOptionsStrings = numPadOptions.toStrings();

  const allNumPad1Solutions = [];

  for (const numPadOptionString of numPadOptionsStrings) {
    const options = sequenceToTypePad(
      numPadOptionString,
      arrowPad,
    );

    for (const result of options.toStrings()) {
      allNumPad1Solutions.push(result);
    }
  }

  const allNumPad2Solutions = [];

  for (const numPadOptionString of allNumPad1Solutions) {
    const options = sequenceToTypePad(
      numPadOptionString,
      arrowPad,
    );

    for (const result of options.toStrings()) {
      allNumPad2Solutions.push(result);
    }
  }

  console.log();
  console.log("*****");
    
  const shortest = lengthShortest(allNumPad2Solutions);
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
    sum += calcBestSequence(input, numPad, arrowPad);

  console.log(sum);
}
