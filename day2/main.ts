function inc(numLine: number[]) {
  return checkOrdered(numLine, (x, y) => y >= x);
}

function dec(numLine: number[]) {
  return checkOrdered(numLine, (x, y) => y <= x);
}

function checkOrdered(
  numLine: number[],
  isOrdered: (x: number, y: number) => boolean,
): boolean {
  if (numLine.length === 0) {
    return false;
  }

  if (numLine.length === 1) {
    return true;
  }

  for (let i = 1; i < numLine.length; i++) {
    if (!isOrdered(numLine[i - 1], numLine[i])) {
      return false;
    }
  }

  return true;
}

function diffLim(numLine: number[]): boolean {
  if (numLine.length === 0 || numLine.length === 1) {
    return true;
  }

  for (let i = 1; i < numLine.length; i++) {
    const diff = Math.abs(numLine[i] - numLine[i - 1]);
    if (diff < 1 || diff > 3) {
      return false;
    }
  }

  return true;
}

function checkLine(numLine: number[]) {
  return (inc(numLine) || dec(numLine)) && diffLim(numLine);
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines: string[] = text.split("\n");
  const numLines = [];

  let index = 0;
  for (const line of lines) {
    numLines[index++] = line.split(" ").map((text) => parseInt(text));
  }

  let numSafe = 0;
  for (const numLine of numLines) {
    const linesList = [];
    linesList.push(numLine);

    for (let i = 0; i < numLine.length; i++) {
      linesList.push(numLine.toSpliced(i, 1));
    }

    if (linesList.map((l) => checkLine(l)).some((x) => x)) {
      numSafe += 1;
    }
  }

  console.log(numSafe);
}
