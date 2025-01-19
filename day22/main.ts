export function modulo(num: bigint, wrap: bigint): bigint {
  if (num < 0) {
    return (wrap + (num % wrap)) % wrap;
  }

  return num % wrap;
}

function nextSecret(secret: bigint): bigint {
  let newSecret = secret;
  newSecret = mixPrune(newSecret, (n) => n * 64n);
  newSecret = mixPrune(newSecret, (n) => n / 32n);
  newSecret = mixPrune(newSecret, (n) => n * 2048n);

  return newSecret;
}

function mixPrune(secret: bigint, mixValueFunc: (n: bigint) => bigint) {
  const mixValue = mixValueFunc(secret);
  const newSecret = mix(secret, mixValue);
  return prune(newSecret);
}

function mix(secret: bigint, value: bigint): bigint {
  return secret ^ value;
}

function prune(secret: bigint): bigint {
  return modulo(secret, 16777216n);
}

function indexOfChanges(
  prices: number[],
  changes: [number, number, number, number],
): number | undefined {
  const currChanges: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const currChangesLen = currChanges.push(change);
    if (currChangesLen === 5) {
      currChanges.shift();
    }

    if (currChanges.length === 4) {
      let isMatch = true;

      for (let p = 0; p < 4; p++) {
        if (changes[p] !== currChanges[p]) {
          isMatch = false;
        }
      }

      if (isMatch) {
        return i;
      }
    }
  }

  return undefined;
}

function getPrices(secret: bigint): number[] {
  const prices: number[] = [];

  prices.push(Number(secret % 10n));

  let temp = secret;
  for (let i = 0; i < 2000; i++) {
    temp = nextSecret(temp);
    prices.push(Number(temp % 10n));
  }

  return prices;
}

function getMatchingPriceWhileBuildingPrices(
  secret: bigint,
  changes: [number, number, number, number],
): number | undefined {
  let currSecret = secret;
  let prevPrice = Number(secret % 10n);
  const currChanges: number[] = [];

  for (let i = 0; i < 2000; i++) {
    currSecret = nextSecret(currSecret);
    const currPrice = Number(currSecret % 10n);
    const currChange = currPrice - prevPrice;
    const len = currChanges.push(currChange);
    if (len === 5) {
      currChanges.shift();
    }

    if (currChanges.length === 4) {
      let isMatch = true;

      for (let p = 0; p < 4; p++) {
        if (changes[p] !== currChanges[p]) {
          isMatch = false;
        }
      }

      if (isMatch) {
        return currPrice;
      }
    }

    prevPrice = currPrice;
  }

  return undefined;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("part2example");
  const lines = text.split("\n");
  const secrets = lines.map((line) => BigInt(line));

  const scoreMap: Map<string, number> = new Map();

  let secretIndex = 0;

  
  for (const secret of secrets) {
    console.log(`Processing ${secretIndex++}`);

    for (let diff1 = -9; diff1 < 10; diff1++) {
      for (let diff2 = -9; diff2 < 10; diff2++) {
        for (let diff3 = -9; diff3 < 10; diff3++) {
          for (let diff4 = -9; diff4 < 10; diff4++) {
            const key = diff1.toString() + diff2.toString() + diff3.toString() +
              diff4.toString();

            const priceFound = getMatchingPriceWhileBuildingPrices(secret, [
              diff1,
              diff2,
              diff3,
              diff4,
            ]);
            if (priceFound) {
              const score = scoreMap.get(key);
              if (score) {
                scoreMap.set(key, score + priceFound);
              } else {
                scoreMap.set(key, priceFound);
              }
            }
          }
        }
      }
    }
  }

  let best = 0;
  let bestKey = "";

  for (const [key, val] of scoreMap) {
    if (val > best) {
      best = val;
      bestKey = key;
    }
  }

  console.log("BEST = " + best + " with best key: " + bestKey);
}
