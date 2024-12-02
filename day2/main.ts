function inc(numLine: number[]): boolean {
  if (numLine.length === 0) {
    return false;
  }

  if (numLine.length === 1) {
    return true;
  }

  for (let i = 1; i < numLine.length; i++) {
    if (numLine[i] < numLine[i - 1]) {
      return false;
    }
  }

  return true;
}

function dec(numLine: number[]): boolean {
  if (numLine.length === 0) {
    return false;
  }

  if (numLine.length === 1) {
    return true;
  }

  for (let i = 1; i < numLine.length; i++) {
    if (numLine[i] > numLine[i - 1]) {
      return false;
    }
  }

  return true;
}

function diffLim(numLine: number[]): boolean {
  console.log("Checking: " + numLine)
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



// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines: string[] = text.split("\n");
  const numLines = [];

  let index = 0;
  for (const line of lines) {
    console.log("Setting " + line);
    numLines[index] = line.split(" ").map(text => parseInt(text));

    index++;
  }

  let numSafe = 0;
  for (const numLine of numLines) {
    if ((inc(numLine) || dec(numLine)) && diffLim(numLine))
      numSafe += 1;
  }

  console.log(numSafe);
}
