import { Pos } from "./pos.ts";

type Controls = "^" | "v" | "<" | ">" | "A";

class Directions {
  numLeft: number;
  numRight: number;
  numUp: number;
  numDown: number;

  constructor(
    numLeft: number,
    numRight: number,
    numUp: number,
    numDown: number,
  ) {
    this.numLeft = numLeft;
    this.numRight = numRight;
    this.numUp = numUp;
    this.numDown = numDown;
  }

  static fromStartEnd(start: Pos, end: Pos): Directions {
    const numLeft = Math.max(start.x - end.x, 0);
    const numRight = Math.max(end.x - start.x, 0);
    const numUp = Math.max(start.y - end.y, 0);
    const numDown = Math.max(end.y - start.y, 0);

    return new Directions(numLeft, numRight, numUp, numDown);
  }
}

class NumPad {
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

    this.directionsMap = NumPad.buildDirectionMap(this.posMap);
  }

  simulatePath(startKey: string, controls: Controls[]): string[] {
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

      simulatedPath.push(this.getNumKey(currPos));
    }

    return simulatedPath;
  }

  getNumKey(pos: Pos): string {
    return this.lines[pos.y][pos.x];
  }

  static buildDirectionMap(posMap: Map<string, Pos>): Map<string, Directions> {
    const directionsMap: Map<string, Directions> = new Map();
    const keyPadKeys = [...posMap.keys().filter((k) => k !== "X")];

    for (const from of keyPadKeys) {
      for (const to of [...keyPadKeys]) {
        const combinedKey = from + to;
        directionsMap.set(
          combinedKey,
          Directions.fromStartEnd(posMap.get(from)!, posMap.get(to)!),
        );
      }
    }

    return directionsMap;
  }
}

if (import.meta.main) {
  const numPadText = await Deno.readTextFile("numpad");
  const numPadLines = numPadText.split("\n");
  const numPad = new NumPad(numPadLines);

  // const text = await Deno.readTextFile("example");
  // const lines = text.split("\n");

  console.log(numPad.directionsMap);
  console.log(numPad.directionsMap.keys().toArray().length);
}
