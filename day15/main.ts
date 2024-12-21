class Pos {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(deltaX: number, deltaY: number) {
    return new Pos(this.x + deltaX, this.y + deltaY);
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

type Spot = "empty" | "box" | "wall";
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

class Board {
  width: number;
  height: number;
  robotPos: Pos = new Pos(-1, -1);
  spots: Spot[][];

  constructor(boardLines: string[]) {
    this.width = boardLines[0].length;
    this.height = boardLines.length;

    this.spots = [];

    for (let y = 0; y < this.width; y++) {
      this.spots.push(Array(this.width).fill("empty"));

      for (let x = 0; x < this.width; x++) {
        const c = boardLines[y][x];

        if (c === "@") {
          this.robotPos = new Pos(x, y);
        } else if (c === "O") {
          this.spots[y][x] = "box";
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
    const nextPositions = this.nextPosList(boxSet, move);

    const hasCollision = nextPositions.some(p => this.getSpot(p) === "wall")
    if (hasCollision)
      return;

    // No collision, time to move
    for (const key of boxSet) {
      this.setSpot(fromKey(key), "empty");
    }

    for (const nextBoxPos of nextPositions) {
      this.setSpot(nextBoxPos, "box");
    }

    this.robotPos = nextPos;
  }

  boxSet(boxPos: Pos, move: Move): Set<number> {
    const set: Set<number> = new Set();

    return this.#boxSet(boxPos, move, set);
  }

  nextPosList(boxSet: Set<number>, move: Move): Pos[] {
    const result: Pos[] = [];
    const [dx, dy] = moveDelta(move);

    for (const key of boxSet) {
      result.push(fromKey(key).add(dx, dy));
    }

    return result;
  }

  #boxSet(pos: Pos, move: Move, set: Set<number>): Set<number> {
    const posSpot = this.getSpot(pos);
    if (posSpot !== "box")
      return set;

    const isNew = !set.has(pos.key);
    if (isNew) {
      set.add(pos.key);

      
      for (const nextPos of this.nextBoxPosList(pos, move)) {
        this.#boxSet(nextPos, move, set);
      }
    }

    return set;
  }

  nextBoxPosList(pos: Pos, move: Move): Pos[] {
    const [dx, dy] = moveDelta(move);
    const nextPos = pos.add(dx, dy);
    return [nextPos];
  }

  getSpot(pos: Pos): Spot {
    return this.spots[pos.y][pos.x];
  }

  setSpot(pos: Pos, spot: Spot) {
    this.spots[pos.y][pos.x] = spot;
  }

  print() {
    for (let y = 0; y < this.width; y++) {
      const spotTexts: string[] = this.spots[y].map((s) =>
        s === "wall" ? "#" : s === "box" ? "O" : "."
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
    for (let y = 0; y < this.width; y++) {
      for (let x = 0; x < this.height; x++) {
        if (this.spots[y][x] === "box") {
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
  const board = new Board(boardLines);

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
