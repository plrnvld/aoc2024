function getChar(row: number, column: number, lines: string[]): string | undefined {
  if (row < 0 || row >= lines.length)
    return undefined;
  if (column < 0 || column >= lines[row].length)
    return undefined;

  return lines[row].charAt(column);
}

function matchEast(rowStart: number, columnStart: number, lines: string[]) {
  return matchXMAS(rowStart, columnStart, 1, 0, lines);
}

function matchWest(rowStart: number, columnStart: number, lines: string[]) {
  return matchXMAS(rowStart, columnStart, -1, 0, lines);
}

function matchNorth(rowStart: number, columnStart: number, lines: string[]) {
  return matchXMAS(rowStart, columnStart, 0, -1, lines);
}

function matchSouth(rowStart: number, columnStart: number, lines: string[]) {
  return matchXMAS(rowStart, columnStart, 0, 1, lines);
}

function matchNorthEast(rowStart: number, columnStart: number, lines: string[]) {
  return matchXMAS(rowStart, columnStart, 1, -1, lines);
}

function matchSouthEast(rowStart: number, columnStart: number, lines: string[]) {
  return matchXMAS(rowStart, columnStart, 1, 1, lines);
}

function matchNorthWest(rowStart: number, columnStart: number, lines: string[]) {
  return matchXMAS(rowStart, columnStart, -1, -1, lines);
}

function matchSouthWest(rowStart: number, columnStart: number, lines: string[]) {
  return matchXMAS(rowStart, columnStart, -1, 1, lines);
}

function matchXMAS(rowStart: number, columnStart: number, deltaRow: number, deltaCol: number, lines: string[]): boolean {
  return getChar(rowStart, columnStart, lines) === 'X' 
    && getChar(rowStart + deltaRow, columnStart + deltaCol, lines) === 'M'
    && getChar(rowStart + 2 * deltaRow, columnStart + 2 * deltaCol, lines) === 'A'
    && getChar(rowStart + 3 * deltaRow, columnStart + 3 * deltaCol, lines) === 'S';
}


if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines: string[] = text.split("\n");

  let count = 0;

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {

      console.log(`Checking row=${y}, col=${x}`);

      if (matchEast(y, x, lines))
        count += 1;
      if (matchSouthEast(y, x, lines))
        count += 1;
      if (matchSouth(y, x, lines))
        count += 1;
      if (matchSouthWest(y, x, lines))
        count += 1;
      if (matchWest(y, x, lines))
        count += 1;
      if (matchNorthWest(y, x, lines))
        count += 1;
      if (matchNorth(y, x, lines))
        count += 1;
      if (matchNorthEast(y, x, lines))
        count += 1;
    }
  }

  console.log(count);
}
