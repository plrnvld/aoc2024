import { NumPad } from "./numpad.ts";

if (import.meta.main) {
  const numPadText = await Deno.readTextFile("numpad");
  const numPadLines = numPadText.split("\n");
  const numPad = new NumPad(numPadLines);

  // const text = await Deno.readTextFile("example");
  // const lines = text.split("\n");

  console.log(numPad.directionsMap);
  console.log(numPad.directionsMap.keys().toArray().length);
}
