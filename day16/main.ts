// https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm#Pseudocode

type Level = "eastWest" | "northSouth";

class Vertex {
  x: number;
  y: number;
  level: Level;
  dist: number;
  prev: Vertex | undefined;

  constructor(x: number, y: number, level: Level) {
    this.x = x;
    this.y = y;
    this.level = level;
    this.dist = Number.MAX_SAFE_INTEGER;
  }
}

class Graph {
  vertices: Vertex[] = [];

  constructor(lines: string[]) {
    // ########
  }

  getCost(from: Vertex, to: Vertex): number | undefined {
    return -1; // ####
  }

  neighbors(vertex: Vertex): Vertex[] {
    return []; // ######
  }
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");
  console.log(lines.length);
}
