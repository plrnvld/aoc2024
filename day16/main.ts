// https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm#Pseudocode

type Level = "leftRight" | "upDown";

class Vertex {
  id: number;
  x: number;
  y: number;
  level: Level;
  dist: number;
  prev: Vertex | undefined;

  constructor(id: number, x: number, y: number, level: Level) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.level = level;
    this.dist = Number.MAX_SAFE_INTEGER;
  }
}

class Graph {
  lines: string[];
  mapWidth: number;
  mapHeight: number;
  vertices: Vertex[] = [];
  costMap: Map<number, number> = new Map();
  neighborsMap: Map<number, number[]> = new Map();
  startVertexId: number = -1;
  targetVertexIds: number[] = [];

  constructor(lines: string[]) {
    this.lines = lines;
    this.mapWidth = lines[0].length;
    this.mapHeight = lines.length;

    const numVerticesHor = (this.mapWidth - 1) / 2;
    const numVerticesVer = (this.mapHeight - 1) / 2;

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

        if (hasPathLeft || hasPathRight) {
          createdVertices.push(this.addNewVertex(x, y, "leftRight"));

          if (c === "S") {
            this.startVertexId = createdVertices.at(0)!.id;
          }
        }

        if (hasPathUp || hasPathDown) {
          createdVertices.push(this.addNewVertex(x, y, "upDown"));
        }

        if (c === "E") {
          createdVertices.forEach((v) => this.targetVertexIds.push(v.id));
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
        }

        if (createdVertices.length === 2) {
          this.setDist(createdVertices[0].id, createdVertices[1].id, 1000);
        }
      }
    }

    if (this.startVertexId === -1) {
      throw new Error("No start found");
    }

    if (this.targetVertexIds.length < 1) {
      throw new Error("No targets found");
    }
  }

  addNewVertex(x: number, y: number, level: Level): Vertex {
    const nextId = this.vertices.length;
    const vertex = new Vertex(nextId, x, y, level);
    this.vertices.push(vertex);

    return vertex;
  }

  isPath(x: number, y: number) {
    const c = this.getChar(x, y);
    return c === "." || c === "S" || c === "E";
  }

  getChar(x: number, y: number): string {
    return this.lines[y][x];
  }

  getDist(fromVertexId: number, to: number): number | undefined {
    return this.costMap.get(this.getEdgeId(fromVertexId, to));
  }

  setDist(fromVertexId: number, to: number, dist: number) {
    this.costMap.set(this.getEdgeId(fromVertexId, to), dist);
  }

  getEdgeId(fromVertexId: number, toVertexId: number): number {
    const lowestId = Math.min(fromVertexId, toVertexId);
    const highestId = Math.max(fromVertexId, toVertexId);

    return lowestId * 1000 + highestId;
  }

  neighbors(vertexId: number): number[] {
    const neighbors = this.neighborsMap.get(vertexId);
    if (neighbors !== undefined) {
      return neighbors;
    }

    throw new Error(`No neighbors found for vertex ${vertexId}`);
  }
}

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines = text.split("\n");
  const graph = new Graph(lines);

  console.log(graph.vertices.length);
}
