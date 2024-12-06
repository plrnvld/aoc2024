
class Edge {
  constructor(from: number, to: number) {
    this.from = from;
    this.to = to;
  }

  from: number;
  to: number;
}

function topologicalSort(nodes: number[], directedEdges: readonly Edge[]): number[] { 
  const orderedList: number[] = [];
  const relevantEdges = directedEdges.filter(e => nodes.includes(e.from) && nodes.includes(e.to));
  let graph = [...relevantEdges];
  

  const nodesWithNoIncomingEdges = getNodesWithNoIncomingEdges(nodes, graph);

  console.log(`Edges count: ${graph.length}`);
  
  while (nodesWithNoIncomingEdges.length > 0) {
    const next = nodesWithNoIncomingEdges.pop()!;
    orderedList.push(next);

    const outgoingFromN = relevantEdges.filter(e => e.from === next);

    for (const outgoing of outgoingFromN) {
      const m = outgoing.to;

      console.log(`> Removing ${outgoing.from}-${outgoing.to} from graph`);
      const sizeBefore = graph.length;
      graph = graph.filter(e => e !== outgoing);
      const sizeAfter = graph.length;
      console.log(`Before size ${sizeBefore}, after size ${sizeAfter}`);

      if (!hasIncomingEdges(m, graph)) {
        nodesWithNoIncomingEdges.push(m);
      }
    }    
  }

  if (graph.length > 0)
    throw new Error("Cycle detection");

  return orderedList;
}

function hasIncomingEdges(node: number, graph: readonly Edge[]): boolean {
  return graph.some(e => e.to === node);
}

function getNodesWithNoIncomingEdges(nodes: number[], graph: readonly Edge[]): number[] {
  const toNodes = graph.map(e => e.to);

  const noIncomingEdges = nodes.filter(n => toNodes.includes(n));

  console.log("No incoming edges: " + noIncomingEdges);

  return noIncomingEdges;
}


function isOrdered(line: number[], notAllowedAfterMap: Map<number, number[]>) {
  for (let i = 0; i < line.length; i++) {
    const curr = line[i];
    const tail = line.slice(i + 1);

    const notAllowedAfter = notAllowedAfterMap.get(curr) ?? [];

    for (const tailNum of tail) {
      if (notAllowedAfter.includes(tailNum)) {
        return false;
      }
    }
  }

  return true;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines: string[] = text.split("\n");

  const emptyIndex = lines.indexOf("");

  const orderingLines = lines.slice(0, emptyIndex);

  const edges = [];

  const notAllowedAfterMap = new Map<number, number[]>();
  for (const line of orderingLines) {
    const parts = line.split("|");
    const goBefore = parseInt(parts[0]);
    const goAfter = parseInt(parts[1]);

    edges.push(new Edge(goBefore, goAfter));

    const notAllowed = notAllowedAfterMap.get(goAfter);

    if (notAllowed) {
      notAllowed.push(goBefore);
      notAllowedAfterMap.set(goAfter, notAllowed);
    } else {
      notAllowedAfterMap.set(goAfter, [goBefore]);
    }
  }

  const checkLines = lines.slice(emptyIndex + 1)
    .map((l) =>
      l.split(",")
        .map((t) => parseInt(t))
    );

  let count = 0;

  for (const line of checkLines) {
    if (isOrdered(line, notAllowedAfterMap)) {
      const middleIndex = (line.length - 1) / 2;
      count += line[middleIndex];
    } else {
      const graphNodes = [...new Set(edges.flatMap(e => [e.from, e.to]))];
      console.log("Sorting: " + graphNodes);
      const sorted = topologicalSort(line, edges);
      console.log("==> Sorted: " + sorted);
    }
  }

  console.log(count);
}
