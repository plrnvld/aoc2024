export function modulo(num: bigint, wrap: bigint): bigint {
  return num % wrap;
}

function nextSecret(secret: number): number {
  let newSecret = secret;
  newSecret = newSecret ^ (newSecret * 64) % 16777216;
  newSecret = newSecret ^ (newSecret / 32) % 16777216;
  let newSecretBig = BigInt(newSecret);
  newSecretBig = newSecretBig ^ (newSecretBig * 2048n) % 16777216n;

  return Number(newSecretBig);
}

function mixPrune(secret: bigint, mixValueFunc: (n: bigint) => bigint) {
  const mixValue = mixValueFunc(secret);
  const newSecret = secret ^ mixValue;
  return newSecret % 16777216n;
}

function mixPrune64(secret: bigint) {
  return secret ^ (secret * 64n) % 16777216n;
}

function mixPrune32(secret: bigint) {
  return secret ^ (secret / 32n) % 16777216n;
}

function mixPrune2048(secret: bigint) {
  return secret ^ (secret * 2048n) % 16777216n;
}

function mix(secret: bigint, value: bigint): bigint {
  return secret ^ value;
}

function prune(secret: bigint): bigint {
  return modulo(secret, 16777216n);
}

function getMatchingPriceWhileBuildingPrices(
  secret: number,
  changes: [number, number, number, number],
): number | undefined {
  let currSecret = secret;
  let prevPrice = secret % 10;

  let matchPos = 0;

  for (let i = 0; i < 2000; i++) {
    currSecret = nextSecret(currSecret);

    const currPrice = currSecret % 10;
    const currChange = currPrice - prevPrice;

    if (currChange === changes[matchPos]) {
      matchPos++;
    } else if (currChange === changes[0]) {
      matchPos = 1;
    } else {
      matchPos = 0;
    }

    if (matchPos === 4) {
      return currPrice;
    }

    prevPrice = currPrice;
  }

  return undefined;
}

function inBounds(
  diff1: number,
  diff2: number,
  diff3: number,
  diff4: number,
): boolean {
  let lowest = Number.MAX_VALUE;
  let highest = Number.MIN_VALUE;

  let temp = 0;

  temp = temp + diff1;
  lowest = Math.min(temp, lowest);
  highest = Math.max(temp, highest);

  temp = temp + diff2;
  lowest = Math.min(temp, lowest);
  highest = Math.max(temp, highest);

  temp = temp + diff3;
  lowest = Math.min(temp, lowest);
  highest = Math.max(temp, highest);

  temp = temp + diff4;
  lowest = Math.min(temp, lowest);
  highest = Math.max(temp, highest);

  return highest - lowest < 10;
}

function isImprovement(diff1: number, diff4: number) {
    return diff4 > -diff1;
}

// When the absolute diff changes are low, there is more chance all prices are high
function isLowChange(diff1: number, diff2: number, diff3: number, diff4: number) {
  const limit = 4;
  const low1 = Math.abs(diff1) < limit;
  const low2 = Math.abs(diff1) < limit;
  const low3 = Math.abs(diff1) < limit;
  const low4 = Math.abs(diff1) < limit;

  const sumLow = diff1 + diff2 + diff3 + diff4 < limit;

  return low1 && low2 && low3 && low4 && sumLow;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");
  const secrets = lines.map((line) => parseInt(line));

  const scoreMap: Map<string, number> = new Map();

  let diffIndex = 0;

  const start = performance.now();

  const totalDiffs = Math.pow(19, 4);

  for (let diff1 = -9; diff1 < 10; diff1++) {
    for (let diff2 = -9; diff2 < 10; diff2++) {
      for (let diff3 = -9; diff3 < 10; diff3++) {
        for (let diff4 = -9; diff4 < 10; diff4++) {
          diffIndex++;
          if (diffIndex % 1000 === 0) {
            console.log(`Processing diffs ${diffIndex} (${Math.round(diffIndex / totalDiffs * 1000) / 10}%)`);
          }

          if (inBounds(diff1, diff2, diff3, diff4) && isImprovement(diff1, diff4) && isLowChange(diff1, diff2, diff3, diff4) ) {
            for (const secret of secrets) {
              const key = diff1.toString() + diff2.toString() +
                diff3.toString() +
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
  }

  const end = performance.now();

  console.log(`Search took ${end - start} ms.`);

  let best = 0;
  let bestKey = "";

  for (const [key, val] of scoreMap) {
    if (val > best) {
      best = val;
      bestKey = key;
    }
  }

  console.log("Best result = " + best + " with changes: " + bestKey);
}

// BEST = 1710 with best key: 0,1,-1,1
