import { ArrowKey } from "./directions.ts";

export class ControlOptionsList {
  list: string[][];

  constructor() {
    this.list = [];
  }

  push(controlOptions: ArrowKey[][]) {
    const arrowKeysAsStrings = controlOptions.map((arrows) =>
      arrows.join("") + "A"
    ); // Active all control options
    this.list.push(arrowKeysAsStrings);
  }

  toStrings(): string[] {
    let aggr: string[] = this.list[0];

    for (let pos = 1; pos < this.list.length; pos++) {
      const newAggr: string[] = [];
      for (const ag of aggr) {
        if (this.list[pos].length === 0) {
          newAggr.push(ag + "A"); // Activate when the robot is already on the right spot
        } else {
          for (const option of this.list[pos]) {
            newAggr.push(ag.concat(option));
          }
        }
      }

      aggr = newAggr;
    }

    return aggr;
  }
}
