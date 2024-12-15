class Pos {
  row: number;
  col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  get key(): number {
    return this.row * 1000 + this.col;
  }

  toString(): string {
    return `${this.row},${this.col}`;
  }
}

type Direction = "up" | "down" | "left" | "right";

class Fence {
  readonly pos: Pos;
  readonly direction: Direction;

  constructor(pos: Pos, direction: Direction) {
    this.pos = pos;
    this.direction = direction;
  }
}

class Area {
  readonly label: string;
  readonly positionKeys: Set<number>;

  constructor(label: string, positionKeys: Set<number>) {
    this.label = label;
    this.positionKeys = positionKeys;
  }

  toString(): string {
    return `${this.label}: ${this.positionKeys}`;
  }

  calculatePrice(plot: Plot): number {
    const areaSize = this.positionKeys.size;

    const fences: Fence[] = [];

    for (const key of this.positionKeys) {
      const pos = fromKey(key);

      const left = plot.left(pos);
      const right = plot.right(pos);
      const up = plot.up(pos);
      const down = plot.down(pos);

      if (left === undefined || !this.positionKeys.has(left.key)) {
        fences.push(new Fence(pos, "left"));
      }

      if (right === undefined || !this.positionKeys.has(right.key)) {
        fences.push(new Fence(pos, "right"));
      }

      if (up === undefined || !this.positionKeys.has(up.key)) {
        fences.push(new Fence(pos, "up"));
      }

      if (down === undefined || !this.positionKeys.has(down.key)) {
        fences.push(new Fence(pos, "down"));
      }
    }

    return areaSize * this.calculateSides(fences, plot);
  }

  calculateSides(fences: Fence[], plot: Plot): number {
    if (fences.length < 4) {
      throw new Error("Cannot close the fence");
    }

    let steps = 1;

    let sides = 0;

    const startFence = fences[0]!;
    let currFence = startFence;
    let nextFence = this.findNextFenceClockwise(currFence, fences, plot);

    while (nextFence !== currFence) {
      if (nextFence.direction !== currFence.direction) {
        sides += 1;
      }

      currFence = nextFence;

      nextFence = this.findNextFenceClockwise(currFence, fences);

      steps += 1;

      if (steps > fences.length) {
        throw new Error("Visiting fences multiple times");
      }
    }

    return sides;
  }

  findNextFenceClockwise(fence: Fence, fences: Fence[], plot: Plot): Fence {
    if (fence.direction === "up") {
      const rightTurn = fences.find(f => f.pos.key === fence.pos.key && f.direction === "right");
      if (rightTurn !== undefined)
        return rightTurn;

      const straigthPos = plot.right(fence.pos);
      if (straigthPos !== undefined) {
        const straight = fences.find(f => f.pos.key === straigthPos.key && f.direction === "up");
        if (straight !== undefined)
          return straight;
      }

      const leftTurnPos = plot.right(fence.pos);
      


    }

    if (fence.direction === "right") {


      
    }

    if (fence.direction === "down") {


      
    }

    if (fence.direction === "left") {


      
    }


    throw new Error("No next fence found");
  }
}

class Plot {
  readonly width: number;
  readonly height: number;
  readonly lines: string[];

  constructor(lines: string[]) {
    this.lines = lines;
    this.width = lines[0].length;
    this.height = lines.length;
  }

  getWithPos(pos: Pos): string {
    return this.#getUnsafe(pos.row, pos.col);
  }

  get(row: number, col: number): string | undefined {
    if (row < 0 || row >= this.width || col < 0 || col >= this.height) {
      return undefined;
    }

    return this.#getUnsafe(row, col);
  }

  #getUnsafe(row: number, col: number): string {
    return this.lines[row].at(col)!;
  }

  get positions(): Pos[] {
    const result: Pos[] = [];

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        result.push(new Pos(row, col));
      }
    }

    return result;
  }

  left(pos: Pos): Pos | undefined {
    if (pos.col <= 0) {
      return undefined;
    }

    return new Pos(pos.row, pos.col - 1);
  }

  right(pos: Pos): Pos | undefined {
    if (pos.col >= this.width - 1) {
      return undefined;
    }

    return new Pos(pos.row, pos.col + 1);
  }

  up(pos: Pos): Pos | undefined {
    if (pos.row <= 0) {
      return undefined;
    }

    return new Pos(pos.row - 1, pos.col);
  }

  down(pos: Pos): Pos | undefined {
    if (pos.row >= this.height - 1) {
      return undefined;
    }

    return new Pos(pos.row + 1, pos.col);
  }
}

function fromKey(key: number): Pos {
  const col = key % 1000;
  const row = (key - col) / 1000;

  return new Pos(row, col);
}

function isSameArea(
  pos: Pos | undefined,
  currLabel: string,
  plot: Plot,
  remaining: Set<number>,
) {
  return pos !== undefined && plot.getWithPos(pos) === currLabel &&
    remaining.has(pos.key);
}

function findAreas(plot: Plot): Area[] {
  const areas: Area[] = [];

  const remaining: Set<number> = new Set();

  for (const pos of plot.positions) {
    remaining.add(pos.key);
  }

  while (remaining.size > 0) {
    const someKey: number = remaining.values().next().value!;
    const keyPos = fromKey(someKey);

    const newArea = growArea(keyPos, remaining, plot);
    areas.push(newArea);
  }

  return areas;
}

// Will remove the start + other positions from grown area from remaining
function growArea(start: Pos, remaining: Set<number>, plot: Plot): Area {
  const label = plot.getWithPos(start);

  const area: Set<number> = new Set();

  const queue: number[] = [start.key];

  while (queue.length > 0) {
    const next = queue.pop()!;
    const nextPos = fromKey(next);

    area.add(next);
    remaining.delete(next);

    const left = plot.left(nextPos);
    const right = plot.right(nextPos);
    const up = plot.up(nextPos);
    const down = plot.down(nextPos);

    if (isSameArea(left, label, plot, remaining)) {
      queue.push(left!.key);
    }

    if (isSameArea(right, label, plot, remaining)) {
      queue.push(right!.key);
    }

    if (isSameArea(up, label, plot, remaining)) {
      queue.push(up!.key);
    }

    if (isSameArea(down, label, plot, remaining)) {
      queue.push(down!.key);
    }
  }

  return new Area(label, area);
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");
  const plot = new Plot(lines);

  const areas = findAreas(plot);

  console.log(
    areas.map((a) => a.calculatePrice(plot)).reduce(
      (sum, next) => sum + next,
      0,
    ),
  );
}
