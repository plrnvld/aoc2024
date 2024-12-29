import { Pos } from "./pos.ts";
import { MemorySpace } from "./memoryspace.ts";
import { Graph } from "./graph.ts";

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
