import { Graph } from "./graph.ts";
import { Racetrack } from "./racetrack.ts";

function dijkstra(graph: Graph): number {
  const queue: number[] = [];
  graph.vertices.forEach((v) => {
    queue.push(v.id);
    v.dist = Number.MAX_SAFE_INTEGER;
    v.prev = undefined;
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

    if (u.id === graph.targetVertexId) {
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

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");

  const racetrack = new Racetrack(lines);

  const graph = new Graph(racetrack);

  const pathCount = dijkstra(graph);
  console.log(pathCount);
}
