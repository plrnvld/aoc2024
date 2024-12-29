type Space = "empty" | "corrupted";

class MemorySpace {
  width: number;
  height: number;
  spaces: Space[][];

  constructor(width: number, height: number, corruptions: Pos[]) {
    this.width = width;
    this.height = height;
    this.spaces = new Array(height);

    for (let y = 0; y < height; y++) {
      this.spaces[y] = Array(width).fill("empty");
    }

    for (const corruption of corruptions) {
      this.spaces[corruption.y][corruption.x] = "corrupted";
    }
  }

  print() {
    for (let y = 0; y < this.height; y++) {
      const line = this.spaces[y].map((s) => s === "corrupted" ? "#" : ".")
        .join("");
      console.log(line);
    }
  }
}

import { Pos } from "./pos.ts";

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines = text.split("\n");
  const corruptions = lines.map((l) => Pos.fromLine(l));

  const size = 7;
  const numCorruptions = 12;

  const memorySpace = new MemorySpace(
    size,
    size,
    corruptions.slice(0, numCorruptions),
  );

  memorySpace.print();
}
