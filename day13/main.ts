class PrizeConfig {
  aDeltaX: number;
  aDeltaY: number;
  bDeltaX: number;
  bDeltaY: number;
  prizeX: number;
  prizeY: number;

  constructor(
    aDeltaX: number,
    aDeltaY: number,
    bDeltaX: number,
    bDeltaY: number,
    prizeX: number,
    prizeY: number,
  ) {
    this.aDeltaX = aDeltaX;
    this.aDeltaY = aDeltaY;
    this.bDeltaX = bDeltaX;
    this.bDeltaY = bDeltaY;
    this.prizeX = prizeX;
    this.prizeY = prizeY;
  }
}

function parsePrizeConfig(block: string): PrizeConfig {
  const lines = block.split("\n");
  const lineA = lines[0];
  const lineB = lines[1];
  const linePrize = lines[2];

  const aParts = lineA.split(", Y");
  const aDeltaY = parseInt(aParts[1]);
  const aDeltaX = parseInt(aParts[0].split("Button A: X")[1]);

  const bParts = lineB.split(", Y");
  const bDeltaY = parseInt(bParts[1]);
  const bDeltaX = parseInt(bParts[0].split("Button B: X")[1]);

  const prizeParts = linePrize.split(", Y=");
  const prizeY = parseInt(prizeParts[1]);
  const prizeX = parseInt(prizeParts[0].split("Prize: X=")[1]);

  return new PrizeConfig(aDeltaX, aDeltaY, bDeltaX, bDeltaY, prizeX, prizeY);
}

function findCheapestPrize(config: PrizeConfig): number | undefined {
  let minimumTokens;

  for (let a = 0; a <= 100; a++) {
    for (let b = 0; b <= 100; b++) {
      if (
        a * config.aDeltaX + b * config.bDeltaX === config.prizeX &&
        a * config.aDeltaY + b * config.bDeltaY === config.prizeY
      ) {
        const tokens = 3 * a + b;
        if (minimumTokens === undefined || tokens < minimumTokens) {
          minimumTokens = tokens;
        }
      }
    }
  }

  return minimumTokens;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const blocks = text.split("\n\n");
  const configs = blocks.map((b) => parsePrizeConfig(b));

  let totalTokens = 0;

  for (const config of configs) {
    console.log(config);
    const tokenCost = findCheapestPrize(config);
    console.log("Cheapest prize = " + tokenCost);

    if (tokenCost !== undefined)
      totalTokens += tokenCost;
  }

  console.log(totalTokens);
}
