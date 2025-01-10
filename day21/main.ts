import { Pad } from "./pad.ts";

if (import.meta.main) {
  const numPadText = await Deno.readTextFile("arrowpad");
  const numPadLines = numPadText.split("\n");
  const pad = new Pad(numPadLines);

  // const text = await Deno.readTextFile("example");
  // const lines = text.split("\n");

  console.log(pad.directionsMap);
  console.log(pad.directionsMap.keys().toArray().length);
}
