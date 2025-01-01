import { Pos } from "./pos.ts";

export type Space = "empty" | "wall";

export class Racetrack {
  width: number;
  height: number;
  spaces: Space[][];

  constructor(width: number, height: number, lines: string[]) {
    this.width = width;
    this.height = height;
    this.spaces = new Array(height);

    // ########
  }

  print() {
    for (let y = 0; y < this.height; y++) {
      const line = this.spaces[y].map((s) => s === "wall" ? "#" : ".")
        .join("");
      console.log(line);
    }
  }
}
