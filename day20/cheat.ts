import { Graph } from "./graph.ts";
import { Pos } from "./pos.ts";
import { Racetrack } from "./racetrack.ts";

export class Cheat {
  start: Pos;
  end: Pos;

  pathWithCheat: number | undefined;
  potentialBenefit: number | undefined;

  constructor(start: Pos, end: Pos) {
    this.start = start;
    this.end = end;
  }

  get wallPos(): Pos {
    const midX = (this.start.x + this.end.x) / 2;
    const midY = (this.start.y + this.end.y) / 2;
    return new Pos(midX, midY);
  }
}

export function findCheats(
  racetrack: Racetrack,
  dijkstraadGraph: Graph,
): Cheat[] {
  const isEmpty = (pos: Pos) => {
    return racetrack.getSpace(pos) === "empty";
  };

  const isWall = (pos: Pos) => {
    return racetrack.getSpace(pos) === "wall";
  };

  const addWhenEmpty = (pos1: Pos, pos2: Pos) => {
    if (isEmpty(pos1) && isEmpty(pos2)) {
      const cheat = new Cheat(pos1, pos2);
      const vertex1 = dijkstraadGraph.getVertexOrError(pos1.key);
      const vertex2 = dijkstraadGraph.getVertexOrError(pos2.key);
      cheat.potentialBenefit = vertex2.dist - 2 - vertex1.dist; // It takes 2 steps to get from pos1 to pos2

      if (cheat.potentialBenefit > 0) {
        cheats.push(cheat);
      }
    }
  };

  const cheats: Cheat[] = [];

  for (let y = 1; y < racetrack.height - 1; y++) {
    for (let x = 1; x < racetrack.width - 1; x++) {
      const wallPos = new Pos(x, y);
      if (isWall(wallPos)) {
        addWhenEmpty(wallPos.left, wallPos.right);
        addWhenEmpty(wallPos.up, wallPos.down);
        addWhenEmpty(wallPos.right, wallPos.left);
        addWhenEmpty(wallPos.down, wallPos.up);
      }
    }
  }

  return cheats;
}
