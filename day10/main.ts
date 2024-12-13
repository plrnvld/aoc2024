class Pos {
  row: number;
  col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  toString() {
    return `(${this.row},${this.col})`;
  }

  get key() {
    return 1000 * this.row + this.col;
  }

  get left() {
    return new Pos(this.row, this.col - 1);
  }

  get right() {
    return new Pos(this.row, this.col + 1);
  }

  get up() {
    return new Pos(this.row - 1, this.col);
  }

  get down() {
    return new Pos(this.row + 1, this.col);
  }
}

function fromKey(key: number): Pos {
  const col = key % 1000;

  const row = (key - col) / 1000;

  return new Pos(row, col);
}

class TopoMap {
  map: number[][];
  width: number;
  height: number;

  constructor(map: number[][]) {
    this.map = map;
    this.height = map.length;
    this.width = map[0].length;
  }

  get(row: number, col: number): number | undefined {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return undefined;
    }

    return this.map[row][col];
  }

  getWithPos(pos: Pos): number | undefined {
    return this.get(pos.row, pos.col);
  }

  get zeroes(): Pos[] {
    const zeroesList = [];
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.get(row, col) === 0) {
          zeroesList.push(new Pos(row, col));
        }
      }
    }

    return zeroesList;
  }
}

function findNines(start: Pos, map: TopoMap): Set<number> {
  let levelSet = new Set<number>();
  levelSet.add(start.key);

  for (let level = 0; level < 9; level++) {
    levelSet = takeMeToTheNextLevel(level, levelSet, map);
  }

  return levelSet;
}

function takeMeToTheNextLevel(
  level: number,
  currPositions: Set<number>,
  map: TopoMap,
): Set<number> {
  const resultSet: Set<number> = new Set();
  const nextLevel = level + 1;

  for (const posKey of currPositions) {
    const pos = fromKey(posKey);
    const left = map.getWithPos(pos.left);
    const right = map.getWithPos(pos.right);
    const up = map.getWithPos(pos.up);
    const down = map.getWithPos(pos.down);

    if (left === nextLevel) {
      console.log(`Found level ${nextLevel} at ${pos.left}`);
      resultSet.add(pos.left.key);
    }

    if (right === nextLevel) {
      console.log(`Found level ${nextLevel} at ${pos.right}`);
      resultSet.add(pos.right.key);
    }

    if (up === nextLevel) {
      console.log(`Found level ${nextLevel} at ${pos.up}`);
      resultSet.add(pos.up.key);
    }

    if (down === nextLevel) {
      console.log(`Found level ${nextLevel} at ${pos.down}`);
      resultSet.add(pos.down.key);
    }
  }

  return resultSet;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const mapLines = text.split("\n").map((line) =>
    Array.from(line).map((c) => parseInt(c))
  );

  const map = new TopoMap(mapLines);

  let nineCount = 0;
  for (const zeroPos of map.zeroes) {
    nineCount += findNines(zeroPos, map).size;
  }

  console.log(nineCount);
}
