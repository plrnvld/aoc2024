class StoneGroup {
  stone: number;
  count: number;

  constructor(stone: number, count: number) {
    this.stone = stone;
    this.count = count;
  }
}

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

function fromUnsortedStones(stones: number[]): StoneGroup[] {
  return fromSortedStones(stones.toSorted());
}

function fromSortedStones(sortedStones: number[]): StoneGroup[] {
  const sortedStoneGroups: StoneGroup[] = [];

  if (sortedStones.length === 0)
    return sortedStoneGroups;

  let currStone = sortedStones[0];
  let currGroupCount = 1;

  for (let i = 1; i < sortedStones.length; i++) {
    const nextStone = sortedStones[i];
    if (nextStone === currStone) {
      currGroupCount += 1;
    } else {
      sortedStoneGroups.push(new StoneGroup(currStone, currGroupCount));
      currStone = nextStone;
      currGroupCount = 1;
    }
  }

  sortedStoneGroups.push(new StoneGroup(currStone, currGroupCount));

  return sortedStoneGroups;
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

  const rounds = 10;
  for (let n = 1; n <= rounds; n++) {
    // console.log(`Round ${n}, last round had ${stonesRound.length} stones.`);
    stonesRound = stonesRound.flatMap(s => applyBlink(s)).toSorted();
    console.log(`Round ${n}: ${stonesRound}`);
    console.log();
  }

  console.log(stonesRound.length);
}
