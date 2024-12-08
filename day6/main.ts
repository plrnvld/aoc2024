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

function colRowDirectionToKey(
  col: number,
  row: number,
  direction: [number, number],
): number {
  const [deltaCol, deltaRow] = direction;

  const dirAddition = deltaCol === 0 && deltaRow === -1
    ? 1000000000
    : deltaCol === 1 && deltaRow === 0
    ? 2000000000
    : deltaCol === 0 && deltaRow === 1
    ? 3000000000
    : deltaCol === -1 && deltaRow === 0
    ? 4000000000
    : -1;

  if (dirAddition === -1) {
    throw new Error("Direction not supported");
  }

  return 10000 * col + row + dirAddition;
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

  let startPosition: [number, number] | undefined = undefined;
  const startDirection: [number, number] = [0, -1];
  const maxCol = lines[0].length - 1;
  const maxRow = lines.length - 1;

  for (let row = 0; row < lines.length; row++) {
    for (let col = 0; col < lines[row].length; col++) {
      const elem = lines[row].charAt(col);

      if (elem === "#") {
        obstacles.add(colRowToKey(col, row));
      } else if (elem === "^") {
        startPosition = [col, row];
      }
    }
  }

  if (!startPosition) {
    throw new Error("No position found");
  }

  let loopCount = 0;

  for (let row = 0; row <= maxRow; row++) {
    for (let col = 0; col <= maxCol; col++) {
      const colRowKey = colRowToKey(col, row);
      if (
        !obstacles.has(colRowKey) || (col !== startPosition[0] &&
          row !== startPosition[1])
      ) {
        const extendedObstacles = new Set([...obstacles]);
        extendedObstacles.add(colRowKey);

        const loopDetected = hasLoop(
          startPosition,
          startDirection,
          maxCol,
          maxRow,
          extendedObstacles,
        );

        if (loopDetected) {
          loopCount += 1;
        }
      }
    }
  }

  console.log(loopCount);
}

function hasLoop(
  startPosition: readonly [number, number],
  startDirection: readonly [number, number],
  maxCol: number,
  maxRow: number,
  obstacles: Set<number>,
): boolean {
  let position: [number, number] = [...startPosition];
  let direction: [number, number] = [...startDirection];

  const visited = new Set<number>();

  visited.add(colRowDirectionToKey(position[0], position[1], direction));

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

    position = nextPosition; // Step

    if (inBounds(position, maxCol, maxRow)) {
      if (
        visited.has(colRowDirectionToKey(position[0], position[1], direction))
      ) {
        console.log("Loop detected at " + position);
        return true;
      }

      visited.add(colRowDirectionToKey(position[0], position[1], direction));
    } else { // Out of bounds
      return false;
    }
  }

  return false;
}

// 2111 too low
