import { Graph } from "./graph.ts";
import { Racetrack } from "./racetrack.ts";
import { Pos } from "./pos.ts";

function dijkstra(graph: Graph): number {
  const stopAtTarget = false; // Measurements show it hardly makes a difference at this map to stop when the target is found
  const queue: number[] = [];
  graph.vertices.forEach((v) => {
    if (v !== undefined) {
      queue.push(v.id);
      v.dist = Number.MAX_SAFE_INTEGER;
      v.prev = undefined;
    }
  });
  const startVertex = graph.getVertexOrError(graph.startVertexId);

  startVertex.dist = 0;

  while (queue.length > 0) {
    let minDist = graph.getVertexOrError(queue[0]).dist;
    let minIndex = 0;

    for (let i = 1; i < queue.length; i++) {
      const currDist = graph.getVertexOrError(queue[i]).dist;
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
    const u = graph.getVertexOrError(uId);

    if (u.id === graph.targetVertexId && stopAtTarget) {
      return u.dist;
    }

    for (const neighborId of neighbors) {
      const isConnected = graph.connected(uId, neighborId);
      if (!isConnected) {
        throw new Error(`Vertices ${uId} and ${neighborId} not connected.`);
      }

      const alt = u.dist + 1;
      const neighbor = graph.getVertexOrError(neighborId);

      if (alt < neighbor.dist) {
        neighbor.dist = alt;
        neighbor.prev = u;
      }
    }
  }

  return graph.getVertexOrError(graph.targetVertexId).dist;
}

function findGreatCheatsFrom(
  startPos: Pos,
  graph: Graph,
  reversedGraph: Graph,
  uncheatedScore: number,
  greatCheatLimit: number,
): number {
  let numGoodCheats = 0;

  const topLeft = new Pos(startPos.x - 20, startPos.y - 20);
  for (let y = 0; y < 41; y++) {
    for (let x = 0; x < 41; x++) {
      const cheatEnd = new Pos(topLeft.x + x, topLeft.y + y);
      const benefit = calcBenefit(
        startPos,
        cheatEnd,
        graph,
        reversedGraph,
        uncheatedScore,
      );
      if (benefit !== undefined && benefit >= greatCheatLimit) {
        numGoodCheats += 1;
      }
    }
  }

  return numGoodCheats;
}

function calcBenefit(
  startCheat: Pos,
  endCheat: Pos | undefined,
  graph: Graph,
  reversedGraph: Graph,
  uncheatedScore: number,
): number | undefined {
  if (endCheat === undefined) {
    return undefined;
  }

  if (
    startCheat.x < 0 || startCheat.x >= graph.width ||
    startCheat.y < 0 || startCheat.y >= graph.height ||
    endCheat.x < 0 || endCheat.x >= graph.width ||
    endCheat.y < 0 || endCheat.y >= graph.height ||
    graph.getSpace(startCheat) === "wall" || graph.getSpace(endCheat) === "wall"
  ) {
    return undefined;
  }

  const manhattanDistance = startCheat.manhattanDistanceTo(endCheat);
  if (manhattanDistance > 20) {
    return undefined;
  }

  const startVertex = graph.getVertexOrUndefined(startCheat.key);
  const endVertex = reversedGraph.getVertexOrUndefined(endCheat.key);
  if (startVertex === undefined || endVertex === undefined) {
    return undefined;
  }

  const cheatedPathLength = startVertex.dist + endVertex.dist +
    manhattanDistance;
  return uncheatedScore - cheatedPathLength;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");

  const racetrack = new Racetrack(lines);

  const graph = new Graph(racetrack);
  const reversedGraph = graph.reverseGraph();

  const pathCount = dijkstra(graph);
  const _ = dijkstra(reversedGraph);

  let greatCheats = 0;

  for (let y = 0; y < racetrack.width; y++) {
    for (let x = 0; x < racetrack.height; x++) {
      const posToCheatFrom = new Pos(x, y);
      const greatCheatLimit = 100;
      greatCheats += findGreatCheatsFrom(
        posToCheatFrom,
        graph,
        reversedGraph,
        pathCount,
        greatCheatLimit,
      );
    }
  }

  console.log(greatCheats);
}
