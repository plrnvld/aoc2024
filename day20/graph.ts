import { Racetrack, Space } from "./racetrack.ts";
import { Pos } from "./pos.ts";

export class Vertex {
  pos: Pos;
  dist: number;
  prev: Vertex | undefined;

  constructor(pos: Pos) {
    this.pos = pos;
    this.dist = Number.MAX_SAFE_INTEGER;
  }

  get id() {
    return this.pos.key;
  }
}

export class Graph {
  width: number;
  height: number;
  vertices: (Vertex | undefined)[];
  racetrack: Racetrack;
  startVertexId: number;
  targetVertexId: number;

  activeCheat: number | undefined;

  constructor(racetrack: Racetrack) {
    this.width = racetrack.width;
    this.height = racetrack.height;
    this.racetrack = racetrack;
    this.startVertexId = racetrack.startPos.key;
    this.targetVertexId = racetrack.endPos.key;
    this.vertices = Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pos = new Pos(x, y);

        if (this.getSpace(pos) === "empty") {
          const vertex = new Vertex(pos);
          this.vertices[vertex.id] = vertex;
        }
      }
    }
  }

  reverseGraph(): Graph {
    const reversedGraph = new Graph(this.racetrack);
    reversedGraph.startVertexId = this.targetVertexId;
    reversedGraph.targetVertexId = this.startVertexId;

    return reversedGraph;
  }

  getVertex(id: number): Vertex {
    const vertex = this.vertices[id];
    if (vertex === undefined) {
      throw new Error("Vertex with id " + id + " not found");
    }

    return vertex;
  }

  getSpace(pos: Pos): Space | undefined {
    return this.racetrack.spaces[pos.y][pos.x];
  }

  connected(vertexId1: number, vertexId2: number): boolean {
    const vertex1 = this.vertices[vertexId1];
    const vertex2 = this.vertices[vertexId2];

    if (vertex1 === undefined || vertex2 === undefined) {
      return false;
    }

    const pos1 = vertex1.pos;
    const pos2 = vertex2.pos;

    return pos1.x === pos2.x && Math.abs(pos1.y - pos2.y) === 1 ||
      pos1.y === pos2.y && Math.abs(pos1.x - pos2.x) === 1;
  }

  neighbors(vertexId: number): number[] {
    const vertex = this.vertices[vertexId];

    if (vertex === undefined) {
      throw new Error("No vertex found for id " + vertexId);
    }

    const neighborPositions = [
      vertex.pos.left,
      vertex.pos.right,
      vertex.pos.up,
      vertex.pos.down,
    ];

    const neighborIds = neighborPositions.map((p) =>
      this.vertices[p.key] !== undefined ? p.key : undefined
    );

    return neighborIds.filter((id) => id !== undefined);
  }

  addCheat(pos: Pos) {
    if (this.activeCheat !== undefined) {
      throw new Error("Another cheat already active");
    }

    if (this.getSpace(pos) !== "wall") {
      throw new Error(`Cheat position ${pos} is not a wall`);
    }

    const vertex = new Vertex(pos);
    this.vertices[vertex.id] = vertex;

    this.activeCheat = vertex.id;
  }

  removeCheat() {
    if (this.activeCheat === undefined) {
      throw new Error("No cheat active");
    }

    this.vertices[this.activeCheat] = undefined;
    this.activeCheat = undefined;
  }
}
