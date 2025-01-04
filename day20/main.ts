import { Graph, Vertex } from "./graph.ts";
import { Racetrack } from "./racetrack.ts";
import { findCheats } from "./cheat.ts";

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

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");

  const racetrack = new Racetrack(lines);

  const graph = new Graph(racetrack);
  const reversedGraph = graph.reverseGraph();

  const pathCount = dijkstra(graph);
  const reversedPathCount = dijkstra(reversedGraph);

  const path = getPath(graph, graph.targetVertexId);

  for (const vertex of path) {
    const otherVertex = reversedGraph.getVertex(vertex.id);
    const sum = vertex.dist + otherVertex.dist;
    console.log(`>  ${sum}`);
  }

  console.log(pathCount);
  console.log(reversedPathCount);

  const cheats = findCheats(racetrack, graph).filter((c) =>
    c.potentialBenefit && c.potentialBenefit >= 100
  );

  console.log("Testing " + cheats.length + " cheats");

  // let i = 0;
  // for (const cheat of cheats) {
  //   if (i % 100 === 0) {
  //     console.log(i);
  //   }
  //   graph.addCheat(cheat.wallPos);

  //   const newResult = dijkstra(graph);

  //   cheat.pathWithCheat = newResult;

  //   graph.removeCheat();
  //   i++;
  // }

  // const grouped = Object.groupBy(cheats, (c) => pathCount - c.pathWithCheat!);

  // console.log();
  // console.log(JSON.stringify(grouped));

  const greatCheats = cheats.filter((c) =>
    c.pathWithCheat && pathCount - c.pathWithCheat >= 100
  );
  console.log("Cheats with a benefit of at least 100:" + greatCheats.length);
}
