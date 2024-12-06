function inBounds(pos: [number, number], maxCol: number, maxRow: number) {
  const [col, row] = pos;

  return col >= 0 && col <= maxCol && row >= 0 && row <= maxRow;
}

function nextPos(
  position: [number, number],
  direction: [number, number],
): [number, number] {
  const [col, row] = position;
  const [deltaCol, deltaRow] = direction;

  return [col + deltaCol, row + deltaRow];
}

function colRowToKey(col: number, row: number): number {
  return 10000 * col + row;
}

function nextDir(direction: [number, number]): [number, number] {
  const [deltaCol, deltaRow] = direction;

  if (deltaCol === 0 && deltaRow === -1) return [1, 0];
  if (deltaCol === 1 && deltaRow === 0) return [0, 1];
  if (deltaCol === 0 && deltaRow === 1) return [-1, 0];
  if (deltaCol === -1 && deltaRow === 0) return [0, -1];
  
  throw new Error("Direction " + direction + " cannot be handled");
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines: string[] = text.split("\n");

  const obstacles = new Set<number>();

  let position: [number, number] | undefined = undefined;
  let direction: [number, number] = [0, -1];
  const maxCol = lines[0].length - 1;
  const maxRow = lines.length - 1;

  const visited = new Set<number>();

  for (let row = 0; row < lines.length; row++) {
    for (let col = 0; col < lines[row].length; col++) {
      const elem = lines[row].charAt(col);

      if (elem === "#") {
        obstacles.add(colRowToKey(col, row));
      } else if (elem === "^") {
        position = [col, row];
      }
    }
  }

  if (!position) {
    throw new Error("No position found");
  }

  console.log("Starting at " + position + " with direction " + direction);

  visited.add(colRowToKey(position[0], position[1]));

  while (inBounds(position, maxCol, maxRow)) {
    let nextPosition = nextPos(position, direction);

    if (obstacles.has(colRowToKey(nextPosition[0], nextPosition[1]))) {
      direction = nextDir(direction);
      nextPosition = nextPos(position, direction);
    }

    if (obstacles.has(colRowToKey(nextPosition[0], nextPosition[1]))) {
      direction = nextDir(direction);
      nextPosition = nextPos(position, direction);
    }

    if (obstacles.has(colRowToKey(nextPosition[0], nextPosition[1]))) {
      direction = nextDir(direction);
      nextPosition = nextPos(position, direction);
    }

    if (obstacles.has(colRowToKey(nextPosition[0], nextPosition[1]))) {
      throw new Error("Nowhere to go");
    }

    position = nextPosition;
    if (inBounds(position, maxCol, maxRow)) {
      visited.add(colRowToKey(position[0], position[1]));
    } else {
      console.log("Out of bounds");
    }
  }

  console.log(visited.size);
}
