import { ArrowKey } from "./directions.ts";
import { distCostSquared } from "./main.ts";
import { Pad } from "./pad.ts";

export class ControlOptionsList {
  list: string[][];

  constructor() {
    this.list = [];
  }

  push(controlOptions: ArrowKey[][], pad: Pad, optimize: boolean) {
    const arrowKeysAsStrings = controlOptions.map((arrows) =>
      arrows.join("") + "A"
    ); // Active all control options

    if (!optimize || arrowKeysAsStrings.length === 0) {
      this.list.push(arrowKeysAsStrings);
      return;
    }

    // ##### Explore optimization
    let minDistCostSquared = Number.MAX_SAFE_INTEGER;
    let bestOptions: string[] = [];

    for (let i = 0; i < arrowKeysAsStrings.length; i++) {
      const curr = arrowKeysAsStrings[i];
      const distSquared = distCostSquared(curr, pad);
      if (distSquared < minDistCostSquared) {
        minDistCostSquared = distSquared;
        bestOptions = [curr];
      }
    }

    this.list.push(bestOptions);
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

  toStringsOptimized(): string {
    const aggr: string[] = [];

    for (let pos = 0; pos < this.list.length; pos++) {
      const curr = this.list[pos][0];

      if (this.list[pos].length === 0) {
        aggr.push("A");
      } else {
        aggr.push(curr);
      }
    }

    return aggr.join("");
  }
}
