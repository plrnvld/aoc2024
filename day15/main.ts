class Pos {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(dx: number, dy: number) {
    return new Pos(this.x + dx, this.y + dy);
  }

  get key(): number {
    return this.y * 1000 + this.x;
  }
}

function fromKey(key: number): Pos {
  const x = key % 1000;
  const y = (key - x) / 1000;

  return new Pos(x, y);
}

type Spot = "empty" | BoxSpot | "wall";
type BoxSpot = "[" | "]";
type Move = "^" | ">" | "<" | "v";

function moveDelta(move: Move): [number, number] {
  switch (move) {
    case "^":
      return [0, -1];
    case ">":
      return [1, 0];
    case "<":
      return [-1, 0];
    case "v":
      return [0, 1];
    default:
      throw new Error(`Move ${move} not recognized.`);
  }
}

class NextPos {
  pos: Pos;
  originalBox: BoxSpot;

  constructor(pos: Pos, originalBox: BoxSpot) {
    this.pos = pos;
    this.originalBox = originalBox;
  }
}

class Board {
  width: number;
  height: number;
  robotPos: Pos = new Pos(-1, -1);
  spots: Spot[][];

  constructor(boardLines: string[]) {
    this.width = boardLines[0].length;
    this.height = boardLines.length;

    this.spots = [];

    for (let y = 0; y < this.height; y++) {
      this.spots.push(Array(this.width).fill("empty"));

      for (let x = 0; x < this.width; x++) {
        console.log(` > Trying to read ${x},${y}`);
        const c = boardLines[y][x];

        if (c === "@") {
          this.robotPos = new Pos(x, y);
        } else if (c === "[") {
          this.spots[y][x] = "[";
        } else if (c === "]") {
          this.spots[y][x] = "]";
        } else if (c === "#") {
          this.spots[y][x] = "wall";
        }
      }
    }

    if (this.robotPos.x === -1 && this.robot.y === -1) {
      throw new Error("No robot found");
    }
  }

  executeMove(move: Move) {
    const [deltaX, deltaY] = moveDelta(move);
    const nextPos = this.robotPos.add(deltaX, deltaY);

    const nextSpot = this.spots[nextPos.y][nextPos.x];
    if (nextSpot === undefined) {
      throw new Error("Walking out of the board");
    } else if (nextSpot === "empty") {
      this.robotPos = nextPos;
      return;
    } else if (nextSpot === "wall") {
      return;
    }

    // Next spot is box

    const boxSet = this.boxSet(nextPos, move);
    const nextPositions = this.movedPosList(boxSet, move);

    const hasCollision = nextPositions.some((p) =>
      this.getSpot(p.pos) === "wall"
    );
    if (hasCollision) {
      return;
    }

    // No collision, time to move
    for (const key of boxSet) {
      this.setSpot(fromKey(key), "empty");
    }

    for (const nextBoxPos of nextPositions) {
      this.setSpot(nextBoxPos.pos, nextBoxPos.originalBox);
    }

    this.robotPos = nextPos;
  }

  movedPosList(boxSet: Set<number>, move: Move): NextPos[] {
    const result: NextPos[] = [];
    const [dx, dy] = moveDelta(move);

    for (const key of boxSet) {
      const pos = fromKey(key);
      const nextPos: Pos = pos.add(dx, dy);
      const originalBox: BoxSpot = this.getSpot(pos) as BoxSpot;
      result.push(new NextPos(nextPos, originalBox));
    }

    return result;
  }

  boxSet(boxPos: Pos, move: Move): Set<number> {
    const set: Set<number> = new Set();

    this.addToBoxSet(boxPos, move, set);
    const boxSpot = this.getSpot(boxPos);
    if (boxSpot === "[")
      this.addToBoxSet(boxPos.add(1, 0), move, set);
      if (boxSpot === "]")
        this.addToBoxSet(boxPos.add(-1, 0), move, set);

    return set;
  }

  addToBoxSet(pos: Pos, move: Move, set: Set<number>): Set<number> {
    const posSpot = this.getSpot(pos);
    if (posSpot !== "[" && posSpot != "]") {
      return set;
    }

    const isNew = !set.has(pos.key);
    if (isNew) {
      set.add(pos.key);

      for (const nextPos of this.nextBoxPosList(pos, move)) {
        this.addToBoxSet(nextPos, move, set);
      }
    }

    return set;
  }

  nextBoxPosList(pos: Pos, move: Move): Pos[] {
    // ###### 
    const [dx, dy] = moveDelta(move);
    const nextPos = pos.add(dx, dy);
    const nextSpot = this.getSpot(nextPos);
    return nextSpot === "]"
      ? [nextPos.add(-1, 0), nextPos]
      : nextSpot === "["
      ? [nextPos, nextPos.add(1, 0)]
      : [nextPos];
  }

  getSpot(pos: Pos): Spot {
    return this.spots[pos.y][pos.x];
  }

  setSpot(pos: Pos, spot: Spot) {
    this.spots[pos.y][pos.x] = spot;
  }

  print() {
    for (let y = 0; y < this.height; y++) {
      const spotTexts: string[] = this.spots[y].map((s) =>
        s === "wall" ? "#" : s === "empty" ? "." : s
      );
      if (this.robotPos.y === y) {
        spotTexts[this.robotPos.x] = "@";
      }

      console.log(spotTexts.join(""));
    }
  }

  get robot(): Pos {
    return this.robotPos;
  }

  get boxScore(): number {
    let sum = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const spot = this.spots[y][x];
        if (spot === "[") {
          sum += y * 100 + x;
        }
      }
    }

    return sum;
  }
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const parts = text.split("\n\n");
  const boardLines = parts[0].split("\n");
  const extendedBoardLines = boardLines.map((line) => {
    return line.split("").map((t) => {
      if (t === "#") {
        return "##";
      }
      if (t === "O") {
        return "[]";
      }
      if (t === ".") {
        return "..";
      }
      if (t === "@") {
        return "@.";
      }

      throw new Error(`Unexpected: ${t}`);
    }).join("");
  });

  for (const line of extendedBoardLines) {
    console.log(line);
  }

  const board = new Board(extendedBoardLines);

  board.print();

  console.log("\n*******\n");

  const moves: Move[] = parts[1].split("").filter((t) => t !== "\n").map((t) =>
    t as Move
  );

  for (const m of moves) {
    board.executeMove(m);
  }

  board.print();
  console.log(board.boxScore);
}

// 1550677