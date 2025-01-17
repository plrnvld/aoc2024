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
  roadBlockVertexId: number = -1;

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

        if (hasPathLeft || hasPathRight || c === "S") {
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
    if (this.roadBlockVertexId !== -1 && 
      (fromVertexId === this.roadBlockVertexId || toVertexId === this.roadBlockVertexId))
      return 10000000;

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

    if (u.id === targetId)
      return u.dist;
    
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

function getPath(dijkstradedGraph: Graph, targetId: number): Vertex[] {
  const targetVertex = dijkstradedGraph.getVertex(targetId);
  let curr = targetVertex;

  const reversedPath: Vertex[] = [];
  while (curr.prev !== undefined) {
    reversedPath.push(curr);
    curr = curr.prev;
  }

  reversedPath.push(curr);
  return reversedPath.toReversed();
}

function pathToPositionKeys(path: Vertex[]): number[] {
  const keys: number[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const vertex1 = path[i];
    const vertex2 = path[i + 1];

    const middleX = (vertex1.x + vertex2.x)/2;
    const middleY = (vertex1.y + vertex2.y)/2;

    keys.push(positionToKey(vertex1.x, vertex1.y));
    keys.push(positionToKey(middleX, middleY));
  }

  const lastVertex = path.at(-1)!;
  keys.push(positionToKey(lastVertex.x, lastVertex.y));

  return keys;
}

function positionToKey(x: number, y: number): number {
  return x * 1000 + y;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");
  const graph = new Graph(lines);

  let minCost = Number.MAX_SAFE_INTEGER;
  let bestPath: Vertex[] = [];
  let bestTargetId: number = -1;
  console.log(`Calculating for ${graph.targetVertexIds.length} target(s)`);
  for (const targetId of graph.targetVertexIds) {
    const cost = dijkstra(graph, graph.startVertexId, targetId);

    if (cost < minCost) {
      minCost = cost;
      bestPath = getPath(graph, targetId);
      bestTargetId = targetId;
    }

    console.log("- Cost: " + cost);
  }

  console.log();

  const bestPlaces: Set<number> = new Set();

  for (const key of pathToPositionKeys(bestPath)) {
    bestPlaces.add(key);
  }

  const detourVertices = graph.vertices.filter(v => {
    return v.id !== graph.startVertexId && v.id !== bestTargetId; 
  });

  console.log(`Checking ${detourVertices.length} detours...`);

  let i = 0;
  for (const detourVertex of detourVertices) {
    if (i % 10 === 0) {
      console.log(`> detour ${i}`);
    }
    i++;

    const costToDetour = dijkstra(graph, graph.startVertexId, detourVertex.id);
    const toDetourPath = getPath(graph, detourVertex.id);
    const costToEnd = dijkstra(graph, detourVertex.id, bestTargetId);
    const toEndPath = getPath(graph, bestTargetId);

    if (costToDetour + costToEnd === minCost) {
      pathToPositionKeys(toDetourPath).forEach(key => bestPlaces.add(key));
      pathToPositionKeys(toEndPath).forEach(key => bestPlaces.add(key));
    }
  }
  
  console.log(bestPlaces.size);
}

// 319 too low
