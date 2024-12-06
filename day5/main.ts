class Edge {
  constructor(from: number, to: number) {
    this.from = from;
    this.to = to;
  }

  from: number;
  to: number;
}

function bruteForceTopologicalSort(
  nodes: readonly number[],
  directedEdges: readonly Edge[],
): number[] {
  let relevantEdges = directedEdges.filter((e) =>
    nodes.includes(e.from) && nodes.includes(e.to)
  );
  let input = [...nodes];
  const sortedNodes = [];

  while (input.length > 0) {
    for (const node of input) {
      if (!relevantEdges.some((e) => e.to === node)) {
        sortedNodes.push(node);
        input = input.filter((item) => item !== node);
        relevantEdges = relevantEdges.filter((e) => e.from !== node);
        break;
      }
    }
  }

  return sortedNodes;
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
  const text = await Deno.readTextFile("input");
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
    if (!isOrdered(line, notAllowedAfterMap)) {
      const sorted = bruteForceTopologicalSort(line, edges);
      const middleIndex = (sorted.length - 1) / 2;
      count += sorted[middleIndex];
    }
  }

  console.log(count);
}
