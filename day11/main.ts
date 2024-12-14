class StoneGroup {
  stone: number;
  count: number;

  constructor(stone: number, count: number = 1) {
    this.stone = stone;
    this.count = count;
  }

  toString(): string {
    return `[${this.count} x stone ${this.stone}]`;
  }
}

function getEvenDigits(stone: number): string | null {
  if (stone <= 0) {
    throw new Error(`Number ${stone} not supported for even digit check.`);
  }

  const stoneText = stone.toString();
  return stoneText.length % 2 === 0 ? stoneText : null;
}

function splitEvenDigits(stoneText: string): number[] {
  const halfLength = stoneText.length / 2;

  return [
    parseInt(stoneText.slice(0, halfLength)),
    parseInt(stoneText.slice(halfLength)),
  ];
}

function applyStoneGroupBlink(stoneGroup: StoneGroup): StoneGroup[] {
  const blinkedStones = applyBlink(stoneGroup.stone);

  return blinkedStones.map((s) => new StoneGroup(s, stoneGroup.count));
}

function applyStoneGroupsBlink(stoneGroups: StoneGroup[]): StoneGroup[] {
  const blinkedGroups = stoneGroups.flatMap((g) => applyStoneGroupBlink(g));

  return combineGroups(blinkedGroups);
}

function combineGroups(stoneGroups: StoneGroup[]): StoneGroup[] {
  if (stoneGroups.length < 2) {
    return stoneGroups;
  }

  const combined: StoneGroup[] = [];
  const sortedGroups = stoneGroups.toSorted(compareGroups);

  let currStone = sortedGroups[0].stone;
  let currCount = sortedGroups[0].count;

  for (let i = 1; i < sortedGroups.length; i++) {
    const nextStone = sortedGroups[i].stone;
    const nextCount = sortedGroups[i].count;

    if (currStone === nextStone) {
      currCount += nextCount;
    } else {
      combined.push(new StoneGroup(currStone, currCount));
      currStone = nextStone;
      currCount = nextCount;
    }
  }

  combined.push(new StoneGroup(currStone, currCount));

  return combined;
}

function compareGroups(x: StoneGroup, y: StoneGroup): number {
  if (x.stone < y.stone) {
    return -1;
  }
  if (x.stone < y.stone) {
    return 1;
  }

  return 0;
}

function applyBlink(stone: number): number[] {
  if (stone === 0) {
    return [1];
  }

  const evenDigits = getEvenDigits(stone);
  if (evenDigits) {
    return splitEvenDigits(evenDigits);
  }

  return [2024 * stone];
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const stoneGroups = text.split(" ").map((t) => parseInt(t)).map((s) =>
    new StoneGroup(s)
  );
  let stonesRound = stoneGroups;

  const rounds = 75;
  for (let n = 1; n <= rounds; n++) {
    stonesRound = applyStoneGroupsBlink(stonesRound);
  }

  console.log(
    stonesRound.map((s) => s.count).reduce(
      (sum, next) => sum + next,
      0,
    ),
  );
}
