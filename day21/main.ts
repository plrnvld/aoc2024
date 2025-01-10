import { ControlOptionsList } from "./controlOptionsList.ts";
import { Pad } from "./pad.ts";

function sequenceToTypeNumPad(nums: string, numPad: Pad): ControlOptionsList {
  const directionsList = new ControlOptionsList();
  
  const requiredKeys = "A" + nums;
  for (let i = 0; i < requiredKeys.length - 1; i++) {
    const pair = requiredKeys.slice(i, i + 2);
    
    const directionsOptions = numPad.directionsMap.get(pair);
    if (directionsOptions === undefined || directionsOptions.validControlOptions.length === 0)
      throw new Error(`No valid options found for '${pair}'`);

    directionsList.push(directionsOptions.validControlOptions);
  }

  return directionsList;
}

if (import.meta.main) {
  const numPadText = await Deno.readTextFile("numpad");
  const numPadLines = numPadText.split("\n");
  const pad = new Pad(numPadLines);

  // const text = await Deno.readTextFile("example");
  // const lines = text.split("\n");

  // console.log(pad.directionsMap);
  // console.log(pad.directionsMap.keys().toArray().length);

  const controlOptions = sequenceToTypeNumPad("029A", pad);

  console.log(JSON.stringify(controlOptions));
}

