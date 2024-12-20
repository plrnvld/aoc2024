class Pos {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Board {
  width: number;
  height: number;
  robotPos: Pos = new Pos(-1, -1);

  constructor(boardLines: string[]) {
    this.width = boardLines[0].length;
    this.height = boardLines.length;

    for (let y = 0; y < this.width; y++)
      for (let x = 0; x < this.width; x++) {
        const c = boardLines[y][x];
    
        if (c === '@')
          this.robotPos = new Pos(x, y);
    
      }

    if (this.robotPos.x === -1 && this.robot.y === -1)
      throw new Error("No robot found")
  }

  get robot(): Pos {  
    return this.robotPos;
  }


}


if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const parts = text.split("\n\n");
  const boardLines = parts[0].split("\n");
  const moves = parts[1];
  const board = new Board(boardLines);

  console.log(board.robotPos);
  console.log(boardLines.length);
  console.log(moves);
}
