class Registers {
  a: bigint;
  b: bigint;
  c: bigint;

  constructor(registerLines: string[]) {
    this.a = this.#readRegister(registerLines[0]);
    this.b = this.#readRegister(registerLines[1]);
    this.c = this.#readRegister(registerLines[2]);
  }

  #readRegister(line: string):bigint {
    return BigInt(line.split(" ")[2]);
  }
}

class Program {
  instructions: number[];
  output: number[];
  pointer: number;
  registers: Registers;

  constructor(
    instructions: number[],
    registers: Registers,
    overwriteA: bigint,
  ) {
    this.instructions = instructions;

    this.registers = registers;
    this.registers.a = overwriteA;

    this.output = [];
    this.pointer = 0;
  }

  checkOutput(expected: number[], checkFromSide: number) {
    
    // console.log(` > Check(${checkFromSide}) Expected = ${expected} Actual = ${this.output}`);

    if (checkFromSide === 0)
      return true;
    
    if (this.output.length !== expected.length) {
      return false;
    }

    for (let i = 0; i < checkFromSide; i++) {
      // const left = i;
      // const right = expected.length - 1 - i;

      // if (
      //   this.output[left] !== expected[left] ||
      //   this.output[right] !== expected[right]
      // ) {
      //   return false;
      // }

      if (this.output[i] !== expected[i]) // ############# 
        return false;
    }

    return true;
  }

  executeAllInstructions() {
    while (this.executeInstruction());
  }

  executeInstruction(): boolean {
    const canContinue = this.pointer < this.instructions.length &&
      this.pointer >= 0;
    if (!canContinue) {
      return false;
    }

    const opCode = this.instructions[this.pointer];
    const inst = this.instructions[this.pointer + 1];
    const operand = BigInt(inst);

    let changedPointer: number | undefined = undefined;

    if (opCode === 0) {
      this.adv(operand);
    } else if (opCode === 1) {
      this.bxl(operand);
    } else if (opCode === 2) {
      this.bst(operand);
    } else if (opCode === 3) {
      changedPointer = this.jnz(operand);
    } else if (opCode === 4) {
      this.bxc(operand);
    } else if (opCode === 5) {
      this.out(operand);
    } else if (opCode === 6) {
      this.bdv(operand);
    } else if (opCode === 7) {
      this.cdv(operand);
    } else {
      throw new Error("Unrecognized operand " + operand);
    }

    if (changedPointer !== undefined) {
      this.pointer = changedPointer;
    } else {
      this.pointer += 2;
    }

    return true;
  }

  // Opcode 0
  adv(combo: bigint) { // truncated( A / 2^combo ) --> A
    const result: bigint = this.registers.a / BigInt(Math.pow(2, Number(this.getComboValue(combo))));
    this.registers.a = result;
  }

  // Opcode 1
  bxl(literal: bigint) { // B `xor` literal --> B
    const result = this.registers.b ^ literal;

    // console.log(
    //   `  > BXL: ${this.registers.b} (#${
    //     this.registers.b.toString(2)
    //   }) XOR ${literal} (#${literal.toString(2)}) => B = ${result} (#${
    //     result.toString(2)
    //   })`,
    // );

    this.registers.b = result;
  }

  // Opcode 2
  bst(combo: bigint) { // combo `modulo` 8 --> B
    const result = modulo(this.getComboValue(combo), 8n);

    // console.log(
    //   `  > BST: ${
    //     this.getComboValueDescription(combo)
    //   } % 8 => B = ${result} (#${result.toString(2)})`,
    // );

    this.registers.b = result;
  }

  // Opcode 3
  jnz(literal: bigint): number | undefined { // if (A == 0) then nothing, else jump to literal, if it jumps, dont increase pointer
    if (this.registers.a === 0n) {
      return undefined;
    }

    if (Number(literal) === this.pointer) {
      return undefined;
    }

    return Number(literal);
  }

  // Opcode 4
  bxc(_: bigint) { // B `xor` C --> B (ignore operand)
    const result = this.registers.b ^ this.registers.c;

    // console.log(
    //   `  > BXC: register B ${this.registers.b} (#${
    //     this.registers.b.toString(2)
    //   }) XOR register C ${this.registers.c} (#${
    //     this.registers.c.toString(2)
    //   }) => B = ${result} (#${result.toString(2)})`,
    // );

    this.registers.b = result;
  }

  // Opcode 5
  out(combo: bigint) { // combo `modulo` 8 --> output (multiple outputs separated by comma's)
    const result = modulo(this.getComboValue(combo), 8n);

    // console.log(
    //   ` > Outputting from: ${
    //     this.getComboValueDescription(combo)
    //   } % 8 = ${result}\n`,
    // );

    this.output.push(Number(result));
  }

  // Opcode 6
  bdv(combo: bigint) { // truncated( A / 2^combo ) --> B
    const result =this.registers.a / BigInt(Math.pow(2, Number(this.getComboValue(combo))));
    this.registers.b = result;
  }

  // Opcode 7
  cdv(combo: bigint) { // truncated( A / 2^combo ) --> C
    const result: bigint = BigInt(Math.trunc(
      Number(this.registers.a) / Number(Math.pow(2, Number(this.getComboValue(combo)))),
    ));

    // console.log(
    //   `    > CDV: trunc(register A ${this.registers.a} (#${
    //     this.registers.a.toString(2)
    //   }) / 2^${this.getComboValueDescription(combo)}) => C = ${result} (% #${
    //     (result % 8).toString(2)
    //   })`,
    // );

    this.registers.c = result;
  }

  getComboValue(combo: bigint): bigint {
    if (combo >= 0n && combo <= 3n) {
      return combo;
    }

    if (combo === 4n) {
      return this.registers.a;
    }

    if (combo === 5n) {
      return this.registers.b;
    }

    if (combo === 6n) {
      return this.registers.c;
    }

    throw new Error("Unrecognized combo " + combo);
  }

  getComboValueDescription(combo: number): string {
    if (combo >= 0 && combo <= 3) {
      return "literal value " + combo;
    }

    if (combo === 4) {
      return "register A (" + this.registers.a + ", #" +
        asBinary(this.registers.a) + ")";
    }

    if (combo === 5) {
      return "register B (" + this.registers.b + ", #" +
        asBinary(this.registers.b) + ")";
    }

    if (combo === 6) {
      return "register C (" + this.registers.c + ", #" +
        asBinary(this.registers.c) + ")";
    }

    throw new Error("Unrecognized combo " + combo);
  }

  printOutput() {
    console.log(this.output);
  }

  matchesOutput(expected: number[], numToMatch: number): boolean {
    for (let i = 0; i < numToMatch; i++) {
      if (this.output[i] !== expected[i]) {
        return false;
      }
    }

    return true;
  }

  matchesOutputLast(expected: number[], numToMatch: number): boolean {
    if (expected.length !== this.output.length) {
      return false;
    }

    for (let i = 0; i < numToMatch; i++) {
      const posToMatch = expected.length - numToMatch;
      if (Number(this.output[posToMatch]) !== expected[posToMatch]) {
        return false;
      }
    }

    return true;
  }
}

function asBinary(num: bigint) {
  return num.toString(2);
}

export function modulo(num: bigint, wrap: bigint): bigint {
  if (num < BigInt(0)) {
    return (wrap + (num % wrap)) % wrap;
  }

  return num % wrap;
}

export { PartialA }
class PartialA {
  registerABytes: number[];
  filled: number;

  constructor(registerABytes: number[], filled: number) {
    this.registerABytes = registerABytes;
    this.filled = filled;
  }

  expandAnswers(): PartialA[] {
    const expanded: PartialA[] = [];

    const nextFilled = this.filled + 1;

    for (let left = 0; left < 8; left++) {
      for (let right = 0; right < 8; right++) {
        const bytes = [...this.registerABytes];
        bytes[nextFilled] = left;
        bytes[bytes.length - 1 - nextFilled] = right;

        expanded.push(new PartialA(bytes, nextFilled));
      }
    }

    return expanded;
  }

  calcRegister(): bigint {
    let result = BigInt(0);
    let base = BigInt(1);

    for (let i = 0; i < this.registerABytes.length; i++) {
      const byte = this.registerABytes[this.registerABytes.length - 1 - i];

      if (byte !== undefined) {
        result = result + base * BigInt(byte);

      }

      base = base * BigInt(16);
    }

    return result; 
  }

  isFilled(): boolean {
    return this.filled === 16; // ######## 
  }

  static newPartialAnswer() {
    return new PartialA(Array(16), 0);
  }
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const parts = text.split("\n\n");
  const registerLines = parts[0].split("\n");
  const programLine = parts[1];
  const instructions = programLine.split(" ")[1].split(",").map((t) =>
    parseInt(t)
  );

  // const overwriteA = Math.pow(8, 15);
  const originalRegisters = new Registers(registerLines);
  const expectedAnswer = instructions;

  
  const queue: PartialA[] = [];

  const startAnswers = [];

  for (let i = 0; i < 8; i++) {
    const undefinedArray = Array(16);
    undefinedArray[0] = 7;
    undefinedArray[15] = i;

    startAnswers.push(new PartialA(undefinedArray, 1));
  }

  startAnswers.forEach((a) => queue.push(a));
  
  const solutions: PartialA[] = [];

  while (queue.length > 0) {
    const partialAnswer = queue.pop()!;

    const registers = structuredClone(originalRegisters);
    const program = new Program(
      instructions,
      registers,
      partialAnswer.calcRegister(),
    );
    program.executeAllInstructions();
    const numToCheck = Math.max(partialAnswer.filled - 2, 0);
    const partialMatch = program.checkOutput(expectedAnswer, numToCheck);

    console.log(`     > Partial(${partialAnswer.calcRegister()}) Expected = ${expectedAnswer} Actual = ${program.output}`);

    if (partialMatch) {

      if (numToCheck > 0)
        console.log(`> partial match. (${numToCheck}) Expected ${expectedAnswer} Actual ${program.output}`);

      if (partialAnswer.isFilled()) {
        solutions.push(partialAnswer);
      } else {
        console.log("Adding new partial answers **** ")
        const newAnswers = partialAnswer.expandAnswers();
        newAnswers.forEach((a) => queue.push(a));
      }
    }
  }

  console.log("Solution count = " + solutions.length);
  for (const solution of solutions) {
    console.log(solution.calcRegister());
  }

  // Input to aim for
  // 2,4,1,1,7,5,1,5,0,3,4,3,5,5,3,0
  // (the answer outputs 16 values)

  // (2) bst 'register A `modulo` 8 --> B' (B will be between 0 and 7) (overwrites B)
  // (1) bxl 'literal 1: register B `xor` 000000001 --> B' (0 -> 1, 1 -> 0, 2 -> 3, 3 -> 2, 4 -> 5, 5 -> 4, 6 -> 7, 7 -> 6)
  // (7) cdv 'register B: truncated(A / 2^register B) --> C' (most of the time when A is big this will be a power of 4, so ending in binary 100) (overwrites C)
  // (1) bxl 'literal 5: register B `xor` 000000101 --> B' (0 -> 5, 1 -> 4, 2 -> 7, 3 -> 6, 4 -> 1, 5 -> 0, 6 -> 3, 7 -> 2)

  // (0) adv 'literal 3' (always divides by 8): 'truncated(register A / 8) --> A' (divide the A counter by 8)

  // (4) bxc 'ignores 3': register B `xor` register C --> B (Most of the time, when A is big, C ends in binary 100, then `xor` flips the 4)
  // (5) out 'register B `modulo` 8': output register B `modulo` 8 (B is always smaller than 8, it will just output B)

  // (3) jnz 'literal 0 if A != 0': start over when A is not 0

  // >> Analysis

  // (1) bxl 'literal 1: register B `xor` 000000001 --> B' (0 -> 1, 1 -> 0, 2 -> 3, 3 -> 2, 4 -> 5, 5 -> 4, 6 -> 7, 7 -> 6)
  // (1) bxl 'literal 5: register B `xor` 000000101 --> B' (0 -> 5, 1 -> 4, 2 -> 7, 3 -> 6, 4 -> 1, 5 -> 0, 6 -> 3, 7 -> 2)

  // Combined (0 -> 4) (1 -> 5) (2 -> 6) (3 -> 7) (4 -> 0) (5 -> 1) (6 -> 2) (7 -> 3)
}

// 164542234324925 too high
// 164545346498493 too high
// 164545346498493
// 164545346498493
// 164545346498237 too high
// 164545346498237
