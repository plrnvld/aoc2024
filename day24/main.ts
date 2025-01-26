type Op =
  | { op: "and"; left: string; right: string; output: string }
  | { op: "or"; left: string; right: string; output: string }
  | { op: "xor"; left: string; right: string; output: string };

class OutputGroup {
  outputOp: Op;
  outputXorChild: Op;
  outputOtherChild: Op;
  terminalGrandChild?: Op;
  nonTerminalGrandChild?: Op;

  constructor(zNum: number, opsList: Op[]) {
    const label = zNum < 10 ? `z0${zNum}` : `z${zNum}`;
    const outputOp = opsList.find((op) => op.output === label);
    if (outputOp === undefined) {
      throw new Error("Cannot find output for num " + zNum);
    }

    this.outputOp = outputOp;
    const leftOutputOp = opsList.find((op) => op.output === outputOp.left);
    if (leftOutputOp === undefined) {
      throw new Error("Cannot find leftOutputOp for num " + zNum);
    }
    const rightOutputop = opsList.find((op) => op.output === outputOp.right);
    if (rightOutputop === undefined) {
      throw new Error("Cannot find leftOutputOp for num " + zNum);
    }

    const [xorChild, otherChild] = leftOutputOp.op === "xor"
      ? [leftOutputOp, rightOutputop]
      : [rightOutputop, leftOutputOp];

    if (xorChild.op !== "xor" && zNum !== 45) {
      throw new Error("Cannot find xorChild for num " + zNum);
    }

    this.outputXorChild = xorChild;
    this.outputOtherChild = otherChild;

    if (zNum > 1) {
      const grandChild1 = opsList.find((op) => op.output === otherChild.left);
      if (grandChild1 === undefined)
        throw new Error("Cannot find grandChild1 for num " + zNum);
      if (grandChild1.op !== "and")
        throw new Error("No AND for grandChild1 for num " + zNum);

      const grandChild2 = opsList.find((op) => op.output === otherChild.right);
      if (grandChild2 === undefined)
        throw new Error("Cannot find grandChild2 for num " + zNum);
      if (grandChild2.op !== "and")
        throw new Error("No AND for grandChild2 for num " + zNum);
    }
  }

  print() {
    this.printOp(this.outputOp);
    this.printOp(this.outputXorChild);
    this.printOp(this.outputOtherChild);
    console.log();
  }

  printOp(op: Op) {
    const [firstOp, secondOp] = op.left.startsWith("y") ? [op.right, op.left] : [op.left, op.right];

    console.log(`${firstOp} ${op.op.toUpperCase()} ${secondOp} -> ${op.output}`);
  }
}

if (import.meta.main) {
  const text = await Deno.readTextFile("clean");
  const lines = text.split("\n");

  const opsList: Op[] = [];
  for (const line of lines) {
    const expr = line.split(" -> ");
    const output = expr[1];
    const input = expr[0].split(" ");
    const oper = input[1];

    const op = oper.toLowerCase();
    if (!["and", "or", "xor"].includes(op)) {
      throw new Error(`Unrecognized operator ${op}`);
    }

    opsList.push(
      { op: op, left: input[0], right: input[2], output: output } as Op,
    );
  }

  const groups: OutputGroup[] = [];
  for (let i = 1; i <= 45; i++) {
    const group = new OutputGroup(i, opsList);
    groups.push(group);
    group.print();
  }

  console.log(groups.length);
}

// hjf, kdh, kpp, sgj, vss, z14, z31, z35 (from notes and from updating file 'clean')
