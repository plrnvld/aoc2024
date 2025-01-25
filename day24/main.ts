type Op =
  | { op: "and"; left: string; right: string; output: string }
  | { op: "or"; left: string; right: string; output: string }
  | { op: "xor"; left: string; right: string; output: string };

function calc(op: Op, leftValue: number, rightValue: number): number {
  if (op.op === "and") {
    return leftValue === 1 && rightValue === 1 ? 1 : 0;
  }
  if (op.op === "or") {
    return leftValue === 0 && rightValue === 0 ? 0 : 1;
  }
  if (op.op === "xor") {
    return leftValue !== rightValue ? 1 : 0;
  }

  throw new Error(`Cannot calculate operator`);
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const parts = text.split("\n\n");

  const inputMap: Map<string, number> = new Map();
  for (const line of parts[0].split("\n")) {
    const wire = line.split(": ");
    const key = wire[0];
    const value = parseInt(wire[1]);
    inputMap.set(key, value);
  }

  let opsList: Op[] = [];
  for (const line of parts[1].split("\n")) {
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

  let skipped: Op[] = [];

  console.log(`Starting with ${opsList.length} operations`);
  // for (const oper of opsList) {
  //   console.log(`OPER: ${JSON.stringify(oper)}`);
  // }

  let round = 1;
  while (opsList.filter((op) => op.output.startsWith("z")).length > 0) {
    const curr = opsList.pop()!;

    const leftVal = inputMap.get(curr.left);
    const rightVal = inputMap.get(curr.right);
    const outputVal = inputMap.get(curr.output);

    if (outputVal !== undefined) {
      throw new Error(`Output ${curr.output} already exists`);
    }

    if (leftVal !== undefined && rightVal !== undefined) {
      const result = calc(curr, leftVal, rightVal);
      inputMap.set(curr.output, result);
      console.log(`> Adding ${curr.output} to input`);
    } else {
      skipped.push(curr);
    }

    opsList = skipped.concat(opsList);
    skipped = [];
  }

  console.log("*********\n");

  const zList: { zNum: number; res: number }[] = [];
  for (const [input, value] of inputMap) {
    if (input.startsWith("z")) {
      const zNum = parseInt(input.slice(1));
      
      zList.push({ zNum: zNum, res: value });
    }
  }

  const zSorted = zList.toSorted((z1, z2) => z2.zNum - z1.zNum);
  const zBits = zSorted.map((n) => n.res.toString()).join("");

  console.log(zSorted);
  console.log(zBits);

  console.log(parseInt(zBits, 2));
}
