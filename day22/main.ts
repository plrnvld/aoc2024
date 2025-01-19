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

function getPrices(secret: bigint): number[] {
  const prices: number[] = [];


  prices.push(Number(secret % 10n));

  let temp = secret;
  for (let i = 0; i < 9; i++) {
    temp = nextSecret(temp);
    prices.push(Number(temp % 10n));
  }

  return prices;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");
  const secrets = lines.map((line) => BigInt(line));

  let sum = 0n;

  for (let secret of secrets) {
    for (let i = 0; i < 2000; i++) {
      secret = nextSecret(secret);
    }

    sum += secret;
  }

  console.log(sum);

  console.log(getPrices(123n));
}
