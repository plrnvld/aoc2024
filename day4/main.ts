function getChar(
  row: number,
  column: number,
  lines: string[],
): string | undefined {
  if (row < 0 || row >= lines.length) {
    return undefined;
  }
  if (column < 0 || column >= lines[row].length) {
    return undefined;
  }

  return lines[row].charAt(column);
}

function matchSouthEastMAS(
  centerRow: number,
  centerCol: number,
  lines: string[],
) {
  return getChar(centerRow - 1, centerCol - 1, lines) === "M" &&
    getChar(centerRow, centerCol, lines) === "A" &&
    getChar(centerRow + 1, centerCol + 1, lines) === "S";
}

function matchNorthWestMAS(
  centerRow: number,
  centerCol: number,
  lines: string[],
) {
  return getChar(centerRow - 1, centerCol - 1, lines) === "S" &&
    getChar(centerRow, centerCol, lines) === "A" &&
    getChar(centerRow + 1, centerCol + 1, lines) === "M";
}

function matchNorthEastMAS(
  centerRow: number,
  centerCol: number,
  lines: string[],
) {
  return getChar(centerRow + 1, centerCol - 1, lines) === "M" &&
    getChar(centerRow, centerCol, lines) === "A" &&
    getChar(centerRow - 1, centerCol + 1, lines) === "S";
}

function matchSouthWestMAS(
  centerRow: number,
  centerCol: number,
  lines: string[],
) {
  return getChar(centerRow + 1, centerCol - 1, lines) === "S" &&
    getChar(centerRow, centerCol, lines) === "A" &&
    getChar(centerRow - 1, centerCol + 1, lines) === "M";
}

function matchSlash(centerRow: number, centerCol: number, lines: string[]) {
  return matchNorthEastMAS(centerRow, centerCol, lines) ||
    matchSouthWestMAS(centerRow, centerCol, lines);
}

function matchBackslash(centerRow: number, centerCol: number, lines: string[]) {
  return matchSouthEastMAS(centerRow, centerCol, lines) ||
    matchNorthWestMAS(centerRow, centerCol, lines);
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines: string[] = text.split("\n");

  let count = 0;

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      if (matchSlash(y, x, lines) && matchBackslash(y, x, lines)) {
        count += 1;
      }
    }
  }

  console.log(count);
}
