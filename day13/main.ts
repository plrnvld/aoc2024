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

  const conversionError = 10000000000000;
  return new PrizeConfig(
    aDeltaX,
    aDeltaY,
    bDeltaX,
    bDeltaY,
    prizeX + conversionError,
    prizeY + conversionError,
  );
}

function solve(config: PrizeConfig): [number, number] | undefined {
  const b: number =
    (config.aDeltaY * config.prizeX - config.aDeltaX * config.prizeY) /
    (config.bDeltaX * config.aDeltaY - config.aDeltaX * config.bDeltaY);

  const a: number = (config.prizeX - config.bDeltaX * b) / config.aDeltaX;

  if (Math.round(a) === a && Math.round(b) === b) {
    console.log(`Solution is A=${a} B=${b}`);
  } else {
    console.log(`No solution`);
    return undefined;
  }

  return [a, b];
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const blocks = text.split("\n\n");
  const configs = blocks.map((b) => parsePrizeConfig(b));

  let totalTokens = 0;

  for (const config of configs) {
    console.log(config);
    const result = solve(config);
    if (result !== undefined) {
      const [a, b] = result;
      const tokenCost = 3 * a + b;
      totalTokens += tokenCost;
    }

    console.log();
  }

  console.log(totalTokens);
}
