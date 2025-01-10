import { ArrowKey, Directions } from "./directions.ts";
import { Pos } from "./pos.ts";

export class Pad {
  lines: string[];
  posMap: Map<string, Pos>;
  directionsMap: Map<string, Directions>;

  constructor(lines: string[]) {
    this.lines = lines;
    this.posMap = new Map();

    for (let y = 0; y < lines.length; y++) {
      for (let x = 0; x < lines[y].length; x++) {
        const c = lines[y].charAt(x);
        this.posMap.set(c, new Pos(x, y));
      }
    }

    this.directionsMap = this.buildDirectionMap(this.posMap);
  }

  simulatePath(startKey: string, controls: ArrowKey[]): string[] {
    const startPos = this.posMap.get(startKey);
    if (startPos === undefined) {
      throw new Error(`position for ${startKey} is undefined`);
    }

    let currPos = startPos;

    const simulatedPath: string[] = [];
    simulatedPath.push(startKey);

    for (const control of controls) {
      if (control === "<") {
        currPos = currPos.left;
      } else if (control === ">") {
        currPos = currPos.right;
      } else if (control === "^") {
        currPos = currPos.up;
      } else {
        currPos = currPos.down;
      }

      simulatedPath.push(this.getPadKey(currPos));
    }

    return simulatedPath;
  }

  getPadKey(pos: Pos): string {
    return this.lines[pos.y][pos.x];
  }

  buildDirectionMap(posMap: Map<string, Pos>): Map<string, Directions> {
    const directionsMap: Map<string, Directions> = new Map();
    const keyPadKeys = [...posMap.keys().filter((k) => k !== "X")];

    for (const from of keyPadKeys) {
      for (const to of [...keyPadKeys]) {
        const combinedKey = from + to;
        directionsMap.set(
          combinedKey,
          Directions.fromStartEnd(from, to, this),
        );
      }
    }

    return directionsMap;
  }
}
