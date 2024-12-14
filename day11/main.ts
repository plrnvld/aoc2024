function getEvenDigits(stone: number): string | null {
  if (stone <= 0)
    throw new Error(`Number ${stone} not supported for even digit check.`);

  const stoneText = stone.toString();
  return stoneText.length % 2 === 0 ? stoneText : null;
}

function splitEvenDigits(stoneText: string): number[] {
  const halfLength = stoneText.length / 2;

  return [parseInt(stoneText.slice(0, halfLength)), parseInt(stoneText.slice(halfLength))];
}

function applyBlink(stone: number): number[] {
  if (stone === 0)
    return [1];

  const evenDigits = getEvenDigits(stone);
  if (evenDigits)
    return splitEvenDigits(evenDigits);

  return [2024 * stone];
}


if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const stones = text.split(" ").map((t) => parseInt(t));
  let stonesRound = stones;

  const rounds = 25;
  for (let n = 1; n <= rounds; n++) {
    stonesRound = stonesRound.flatMap(s => applyBlink(s));
    // console.log(`Round ${n}: ${stonesRound}`);
  }

  console.log(stonesRound.length);
}
