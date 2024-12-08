class Pos {
  row: number;
  col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }
}

class AntennaMap {
  width: number;
  height: number;
  antennas: Map<string, Pos[]>;

  constructor(antennas: Map<string, Pos[]>, width: number, height: number) {
    this.antennas = antennas;
    this.width = width;
    this.height = height;
  }

  inBounds(pos: Pos) {
    return pos.row >= 0 && pos.row < this.height && pos.col >= 0 &&
      pos.col < this.width;
  }
}

function combinations(positions: Pos[]): [Pos, Pos][] {
  const combs: [Pos, Pos][] = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      combs.push([positions[i], positions[j]]);
    }
  }

  return combs;
}

function antinodes(position1: Pos, position2: Pos): Pos[] {
  const diffRow = position2.row - position1.row;
  const diffCol = position2.col - position1.col;

  const antinode1 = new Pos(position1.row - diffRow, position1.col - diffCol);
  const antinode2 = new Pos(position2.row + diffRow, position2.col + diffCol);

  return [antinode1, antinode2];
}

function rowColToKey(row: number, col: number): number {
  return row * 1000 + col;
}

function countAntinodes(antennaMap: AntennaMap): number {
  const antinodeSet: Set<number> = new Set();

  for (const antennaName of antennaMap.antennas.keys()) {
    const combs = combinations(antennaMap.antennas.get(antennaName)!);

    for (const comb of combs) {
      const antisInBounds = antinodes(comb[0], comb[1]).filter((a) =>
        antennaMap.inBounds(a)
      );

      for (const antiInBounds of antisInBounds) {
        antinodeSet.add(rowColToKey(antiInBounds.row, antiInBounds.col));
      }
    }
  }

  return antinodeSet.size;
}

async function readAntennas(fileName: string): Promise<AntennaMap> {
  const text = await Deno.readTextFile(fileName);
  const lines: string[] = text.split("\n");

  const antennas: Map<string, Pos[]> = new Map();

  for (let row = 0; row < lines.length; row++) {
    for (let col = 0; col < lines[row].length; col++) {
      const c = lines[row].at(col)!;

      const newPos = new Pos(row, col);

      if (c !== ".") {
        const currentPositions = antennas.get(c);
        if (currentPositions) {
          antennas.set(c, currentPositions.concat(newPos));
        } else {
          antennas.set(c, [newPos]);
        }
      }
    }
  }

  return new AntennaMap(antennas, lines[0].length, lines.length);
}

if (import.meta.main) {
  const antennaMap = await readAntennas("input");

  const count = countAntinodes(antennaMap);

  console.log(count);
}
