class Pos {
  row: number;
  pos: number;

  constructor(row: number, pos: number) {
    this.row = row;
    this.pos = pos;
  }
}

async function readAntennas(fileName: string): Promise<Map<string, Pos[]>> {
  const text = await Deno.readTextFile(fileName);
  const lines: string[] = text.split("\n");

  const antennas: Map<string, Pos[]> = new Map();

  for (let row = 0; row < lines.length; row++) {
    for (let col = 0; col < lines[row].length; col++) {
      const c = lines[row].at(col)!;

      const newPos = new Pos(row, col)

      if (c !== ".") {
        const currentEntry = antennas.get(c);
        if (currentEntry) {
          const newPositions = currentEntry.concat(newPos);
          antennas.set(c, newPositions);
        } else {
          antennas.set(c, [newPos]);
        }
      }
    }
  }

  return antennas;
}

if (import.meta.main) {
  const antennas = await readAntennas("example");
  

  for (const key of antennas.keys()) {
    console.log(`[${key}]: ${antennas.get(key)?.map(p => JSON.stringify(p))}`);
  }
}
