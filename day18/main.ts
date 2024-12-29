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

class Vertex {
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

class Graph {
  width: number;
  height: number;
  vertices: Vertex[] = [];
  costMap: Map<number, number> = new Map();
  neighborsMap: Map<number, number[]> = new Map();
  startVertexId: number;
  targetVertexId: number;

  constructor(memorySpace: MemorySpace) {
    this.width = memorySpace.width;
    this.height = memorySpace.height;
    this.startVertexId = new Pos(0, 0).key;
    this.targetVertexId = new Pos(this.width - 1, this.height - 1).key;

    const numVerticesHor = (this.width - 1) / 2;
    const numVerticesVer = (this.height - 1) / 2;

    for (let vertexRow = 0; vertexRow < numVerticesVer; vertexRow++) {
      for (let vertexCol = 0; vertexCol < numVerticesHor; vertexCol++) {
        const x = 1 + 2 * vertexCol;
        const y = 1 + 2 * vertexRow;

        const onMap = this.isPath(x, y);
        if (!onMap) {
          throw new Error(`Expected vertex location ${x},${y} not empty.`);
        }

        const hasPathLeft = this.isPath(x - 1, y);
        const hasPathRight = this.isPath(x + 1, y);
        const hasPathUp = this.isPath(x, y - 1);
        const hasPathDown = this.isPath(x, y + 1);

        const c = this.getChar(x, y);
        const createdVertices: Vertex[] = [];

        if (hasPathLeft || hasPathRight || c === "S") {
          createdVertices.push(this.addNewVertex(x, y));

          if (c === "S") {
            this.startVertexId = createdVertices.at(0)!.id;
          }
        }

        if (hasPathUp || hasPathDown) {
          createdVertices.push(this.addNewVertex(x, y, "upDown"));
        }

        if (hasPathLeft) { // Connect with previously added vertex on the left
          const currVertex = createdVertices[0];
          const leftVertex = this.vertices.find((v) =>
            v.x === currVertex.x - 2 && v.y === currVertex.y &&
            v.level === "leftRight"
          );

          if (leftVertex === undefined) {
            throw new Error("Could not find left vertex");
          }

          this.setDist(leftVertex.id, currVertex.id, 2);
          this.addNeighbors(leftVertex.id, currVertex.id);
        }

        if (hasPathUp) { // Connect with previously added vertex up
          const currVertex = createdVertices.at(-1)!;
          const upVertex = this.vertices.find((v) =>
            v.x === currVertex.x && v.y === currVertex.y - 2 &&
            v.level === "upDown"
          );

          if (upVertex === undefined) {
            throw new Error(
              `Could not find up vertex for ${currVertex.x},${currVertex.y}`,
            );
          }

          this.setDist(upVertex.id, currVertex.id, 2);
          this.addNeighbors(upVertex.id, currVertex.id);
        }

        if (createdVertices.length === 2) {
          this.setDist(createdVertices[0].id, createdVertices[1].id, 1000);
          this.addNeighbors(createdVertices[0].id, createdVertices[1].id);
        }
      }
    }
  }

  addNewVertex(x: number, y: number): Vertex {
    const nextId = this.vertices.length;
    const vertex = new Vertex(nextId);
    this.vertices.push(vertex);

    return vertex;
  }

  addNeighbors(vertexId1: number, vertexId2: number) {
    this.addNeighborTo(vertexId1, vertexId2);
    this.addNeighborTo(vertexId2, vertexId1);
  }

  addNeighborTo(neighborId: number, toVertexId: number) {
    const neighbors = this.neighborsMap.get(toVertexId);
    if (neighbors !== undefined) {
      neighbors.push(neighborId);
      this.neighborsMap.set(toVertexId, neighbors);
    } else {
      this.neighborsMap.set(toVertexId, [neighborId]);
    }
  }

  isPath(x: number, y: number) {
    const c = this.getChar(x, y);
    return c === "." || c === "S" || c === "E";
  }

  getChar(x: number, y: number): string {
    return this.lines[y][x];
  }

  getDist(fromVertexId: number, toVertexId: number): number | undefined {
    return this.costMap.get(this.getEdgeId(fromVertexId, toVertexId));
  }

  getVertex(id: number): Vertex {
    const vertex = this.vertices[id];
    if (vertex === undefined) {
      throw new Error("Cannot find vertex " + id);
    }

    return vertex;
  }

  setDist(fromVertexId: number, to: number, dist: number) {
    this.costMap.set(this.getEdgeId(fromVertexId, to), dist);
  }

  getEdgeId(fromVertexId: number, toVertexId: number): number {
    const lowestId = Math.min(fromVertexId, toVertexId);
    const highestId = Math.max(fromVertexId, toVertexId);

    return lowestId * 1000000 + highestId;
  }

  neighbors(vertexId: number): number[] {
    const neighbors = this.neighborsMap.get(vertexId);
    if (neighbors !== undefined) {
      return neighbors;
    }

    throw new Error(`No neighbors found for vertex ${vertexId}`);
  }
}

function dijkstra(graph: Graph, startId: number, targetId: number): number {
  const queue: number[] = [];
  graph.vertices.forEach((v) => {
    queue.push(v.id);
    v.dist = Number.MAX_SAFE_INTEGER;
    v.prev = undefined;
  });
  const startVertex = graph.getVertex(startId);
  startVertex.dist = 0;

  while (queue.length > 0) {
    queue.sort((a, b) => {
      const aDist = graph.getVertex(a).dist;
      const bDist = graph.getVertex(b).dist;

      // Reversed order, biggest first
      if (aDist > bDist) {
        return -1;
      }
      if (aDist < bDist) {
        return 1;
      }

      return 0;
    });

    const uId = queue.pop()!; // Take last from reversed order is the smallest;
    const neighbors = graph.neighbors(uId);
    const u = graph.getVertex(uId);

    if (u.id === targetId) {
      return u.dist;
    }

    for (const neighborId of neighbors) {
      const neighborDist = graph.getDist(uId, neighborId);
      if (neighborDist === undefined) {
        throw new Error("Neighbor dist cannot be empty");
      }
      const alt = u.dist + neighborDist;
      const neighbor = graph.getVertex(neighborId);

      if (alt < neighbor.dist) {
        neighbor.dist = alt;
        neighbor.prev = u;
      }
    }
  }

  return graph.getVertex(targetId).dist;
}

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
