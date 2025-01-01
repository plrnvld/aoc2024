import { Graph } from "./graph.ts";
import { Pos } from "./pos.ts";
import { Racetrack } from "./racetrack.ts";

function dijkstra(graph: Graph): number {
  const stopAtTarget = false; // Measurements show it hardly makes a difference at this map to stop when the target is found
  const queue: number[] = [];
  graph.vertices.forEach((v) => { if (v !== undefined) {
    queue.push(v.id);
    v.dist = Number.MAX_SAFE_INTEGER;
    v.prev = undefined;
  }});
  const startVertex = graph.getVertex(graph.startVertexId);

  startVertex.dist = 0;

  while (queue.length > 0) {
    let minDist = graph.getVertex(queue[0]).dist;
    let minIndex = 0;

    for (let i = 1; i < queue.length; i++) {
      const currDist = graph.getVertex(queue[i]).dist;
      if (currDist < minDist) {
        minDist = currDist;
        minIndex = i;
      }
    }

    const lastIndex = queue.length - 1;
    if (minIndex !== lastIndex) { // Not last index, swap vertex ids, so lowest dist is last
      const tempVertexId = queue[lastIndex];
      queue[lastIndex] = queue[minIndex];
      queue[minIndex] = tempVertexId;
    }

    const uId = queue.pop()!;

    const neighbors = graph.neighbors(uId);
    const u = graph.getVertex(uId);

    if (u.id === graph.targetVertexId && stopAtTarget) {
      return u.dist;
    }

    for (const neighborId of neighbors) {
      const isConnected = graph.connected(uId, neighborId);
      if (!isConnected) {
        throw new Error(`Vertices ${uId} and ${neighborId} not connected.`);
      }

      const alt = u.dist + 1;
      const neighbor = graph.getVertex(neighborId);

      if (alt < neighbor.dist) {
        neighbor.dist = alt;
        neighbor.prev = u;
      }
    }
  }

  return graph.getVertex(graph.targetVertexId).dist;
}

class Cheat {
  start: Pos;
  end: Pos;

  pathWithCheat: number | undefined;
  potentialBenefit: number | undefined;

  constructor(start: Pos, end: Pos) {
    this.start = start;
    this.end = end;
  }

  get wallPos(): Pos {
    const midX = (this.start.x + this.end.x) / 2;
    const midY = (this.start.y + this.end.y) / 2;
    return new Pos(midX, midY);
  }
}

function findCheats(racetrack: Racetrack, dijkstraadGraph: Graph): Cheat[] {
  const isEmpty = (pos: Pos) => {
    return racetrack.getSpace(pos) === "empty";
  };

  const isWall = (pos: Pos) => {
    return racetrack.getSpace(pos) === "wall";
  };

  const addWhenEmpty = (pos1: Pos, pos2: Pos) => {
    if (isEmpty(pos1) && isEmpty(pos2)) {
      const cheat = new Cheat(pos1, pos2);
      const vertex1 = dijkstraadGraph.getVertex(pos1.key);
      const vertex2 = dijkstraadGraph.getVertex(pos2.key);
      cheat.potentialBenefit = vertex2.dist - 2 - vertex1.dist; // It takes 2 steps to get from pos1 to pos2

      if (cheat.potentialBenefit > 0) {
        cheats.push(cheat);
      }
    }
  };

  const cheats: Cheat[] = [];

  for (let y = 1; y < racetrack.height - 1; y++) {
    for (let x = 1; x < racetrack.width - 1; x++) {
      const wallPos = new Pos(x, y);
      if (isWall(wallPos)) {
        addWhenEmpty(wallPos.left, wallPos.right);
        addWhenEmpty(wallPos.up, wallPos.down);
        addWhenEmpty(wallPos.right, wallPos.left);
        addWhenEmpty(wallPos.down, wallPos.up);
      }
    }
  }

  return cheats;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines = text.split("\n");

  const racetrack = new Racetrack(lines);

  const graph = new Graph(racetrack);

  const pathCount = dijkstra(graph);
  console.log(pathCount);

  const cheats = findCheats(racetrack, graph);

  for (const cheat of cheats) {
    graph.addCheat(cheat.wallPos);

    const newResult = dijkstra(graph);

    cheat.pathWithCheat = newResult;

    graph.removeCheat();
  }
  
  
  // for (const cheat of cheats) {
  //   if (cheat.pathWithCheat && cheat.pathWithCheat < pathCount) {
  //     console.log(JSON.stringify(cheat));
  //   }
  // }

  const grouped = Object.groupBy(cheats, c => pathCount - c.pathWithCheat!);

  console.log();
  console.log(JSON.stringify(grouped));
}
