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

  for (const edge of edges) {
    allComputers.add(edge.computer1);
    allComputers.add(edge.computer2);
  }
  
  console.log(edges.length);
  console.log(allComputers.size);
}
