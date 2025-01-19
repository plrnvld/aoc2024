class Edge {
  computer1: string;
  computer2: string;

  constructor(line: string) {
    const parts = line.split("-");
    this.computer1 = parts[0];
    this.computer2 = parts[1];
  }
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");
  const edges = lines.map(line => new Edge(line));

  const allComputers: Set<string> = new Set();

  const computerList: string[] = [];

  for (const edge of edges) {
    allComputers.add(edge.computer1);
    allComputers.add(edge.computer2);
  }

  for (const computer of allComputers.keys()) {
    computerList.push(computer);
  }

  const connectedMap: Map<string, Set<string>> = new Map();

  for (let i = 0; i < computerList.length; i++) {
    connectedMap.set(computerList[i], new Set());
  }

  for (const edge of edges) {
    const connectedSet1 = connectedMap.get(edge.computer1)!;
    const connectedSet2 = connectedMap.get(edge.computer2)!;

    connectedSet1.add(edge.computer2);
    connectedMap.set(edge.computer1, connectedSet1);
    connectedSet2.add(edge.computer1);
    connectedMap.set(edge.computer2, connectedSet2);
  }

  const connectedTriplets: Set<string> = new Set();

  for (const [key, vals] of connectedMap) {
    const connectedList = Array.from(vals.values());
    
    for (let i = 0; i < connectedList.length; i++) {
      for (let j = i + 1; j < connectedList.length; j++) {
        const computer1 = key;
        const computer2 = connectedList[i];
        const computer3 = connectedList[j];
        
        if (connectedMap.get(computer2)!.has(computer3)) { // Are the three connected
          if (computer1.startsWith("t") || computer2.startsWith("t") || computer3.startsWith("t")) {
            const namesCombined = [computer1, computer2, computer3].toSorted().join("");

            connectedTriplets.add(namesCombined);
          }
        }
      }
    }
    

    // console.log(`Computer '${key}': ${text}`);
  }

  console.log(connectedTriplets.size);
}
