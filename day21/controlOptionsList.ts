import { ArrowKey } from "./directions.ts";

export class ControlOptionsList {
  list: string[][];

  constructor() {
    this.list = [];
  }

  push(controlOptions: ArrowKey[][]) {
    const arrowKeysAsStrings = controlOptions.map(arrows => arrows.join("") + "A"); // Active all control options
    this.list.push(arrowKeysAsStrings);
  }
}
