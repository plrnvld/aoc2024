import { Pos } from "./pos.ts";

export type Space = "empty" | "wall";

export class Racetrack {
  width: number;
  height: number;
  spaces: Space[][];
  startPos: Pos;
  endPos: Pos;

  constructor(lines: string[]) {
    this.width = lines[0].length;
    this.height = lines.length;
    this.spaces = new Array(this.height);

    let startPos;
    let endPos;

    for (const [y, line] of lines.entries()) {
      const sIndex = line.indexOf("S");
      const eIndex = line.indexOf("E");

      if (sIndex !== -1) {
        startPos = new Pos(sIndex, y);
      }

      if (eIndex !== -1) {
        endPos = new Pos(eIndex, y);
      }

      const spaceLine: Space[] = line.split("").map((l) =>
        l === "#" ? "wall" : "empty"
      );
      this.spaces[y] = spaceLine;
    }

    if (startPos === undefined) {
      throw new Error("No start position found");
    }

    if (endPos === undefined) {
      throw new Error("No end position found");
    }

    this.startPos = startPos;
    this.endPos = endPos;
  }

  getSpace(pos: Pos): Space {
    return this.spaces[pos.y][pos.x];
  }

  print() {
    const changeChar = (line: string, index: number, char: string) => {
      return line.slice(0, index) + char + line.slice(index + 1);
    };

    for (let y = 0; y < this.height; y++) {
      let line = this.spaces[y].map((s) => s === "wall" ? "#" : ".")
        .join("");

      if (this.startPos.y === y) {
        line = changeChar(line, this.startPos.x, "S");
      }

      if (this.endPos.y === y) {
        line = changeChar(line, this.endPos.x, "E");
      }

      console.log(line);
    }
  }
}
