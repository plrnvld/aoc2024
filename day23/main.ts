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
  const edges = lines.map((line) => new Edge(line));

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

  let bestSet: Set<string> = new Set();
  let bestSetSize = 0;

  for (const [key, values] of connectedMap) {
    const valuesList = Array.from(values);

    const setFromKey: Set<string> = new Set();
    setFromKey.add(key);

    for (let j = 0; j < valuesList.length; j++) {
      const next = valuesList[j];
      let allConnected = true;

      for (const compFromSet of setFromKey) {
        const valuesConnectedToNext = connectedMap.get(next)!;
        if (!valuesConnectedToNext.has(compFromSet)) {
          allConnected = false;
        }
      }

      if (allConnected) {
        setFromKey.add(next);
      }
    }

    const setSize = setFromKey.size;
    if (setSize > bestSetSize) {
      bestSetSize = setSize;
      bestSet = setFromKey;
    }
  }

  console.log(bestSet);

  const bestList = Array.from(bestSet);
  const sortedList = bestList.toSorted();
  console.log(sortedList.join(","));
}
