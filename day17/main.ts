class Registers {
  a: number;
  b: number;
  c: number;

  constructor(registerLines: string[]) {
    this.a = this.#readRegister(registerLines[0]);
    this.b = this.#readRegister(registerLines[1]);
    this.c = this.#readRegister(registerLines[2]);
  }

  #readRegister(line: string) {
    return parseInt(line.split(" ")[2]);
  }
}

class Program {
  instructions: number[];
  output: number[];
  pointer: number;
  registers: Registers;

  constructor(programLine: string, registers: Registers, overwriteA: number) {
    this.instructions = programLine.split(" ")[1].split(",").map((t) =>
      parseInt(t)
    );

    this.registers = registers;
    this.registers.a = overwriteA;

    this.output = [];
    this.pointer = 0;
  }

  executeInstruction(): boolean {
    const canContinue = this.pointer < this.instructions.length &&
      this.pointer >= 0;
    if (!canContinue) {
      return false;
    }

    const opCode = this.instructions[this.pointer];
    const operand = this.instructions[this.pointer + 1];

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
  adv(combo: number) { // truncated( A / 2^combo ) --> A
    const result = Math.trunc(
      this.registers.a / Math.pow(2, this.getComboValue(combo)),
    );
    this.registers.a = result;
  }

  // Opcode 1
  bxl(literal: number) { // B `xor` literal --> B
    const result = this.registers.b ^ literal;
    this.registers.b = result;
  }

  // Opcode 2
  bst(combo: number) { // combo `modulo` 8 --> B
    const result = modulo(this.getComboValue(combo), 8);
    this.registers.b = result;
  }

  // Opcode 3
  jnz(literal: number): number | undefined { // if (A == 0) then nothing, else jump to literal, if it jumps, dont increase pointer
    if (this.registers.a === 0) {
      return undefined;
    }

    if (literal === this.pointer) {
      return undefined;
    }

    return literal;
  }

  // Opcode 4
  bxc(_: number) { // B `xor` C --> B (ignore operand)
    const result = this.registers.b ^ this.registers.c;
    this.registers.b = result;
  }

  // Opcode 5
  out(combo: number) { // combo `modulo` 8 --> output (multiple outputs separated by comma's)
    const result = modulo(this.getComboValue(combo), 8);

    console.log(` > Outputting from: ${this.getComboValueDescription(combo)} % 8 = ${result}`);
    this.output.push(result);
  }

  // Opcode 6
  bdv(combo: number) { // truncated( A / 2^combo ) --> B
    const result = Math.trunc(
      this.registers.a / Math.pow(2, this.getComboValue(combo)),
    );
    this.registers.b = result;
  }

  // Opcode 7
  cdv(combo: number) { // truncated( A / 2^combo ) --> C
    const result = Math.trunc(
      this.registers.a / Math.pow(2, this.getComboValue(combo)),
    );
    this.registers.c = result;
  }

  getComboValue(combo: number): number {
    if (combo >= 0 && combo <= 3) {
      return combo;
    }

    if (combo === 4) {
      return this.registers.a;
    }

    if (combo === 5) {
      return this.registers.b;
    }

    if (combo === 6) {
      return this.registers.c;
    }

    throw new Error("Unrecognized combo " + combo);
  }

  getComboValueDescription(combo: number): string {
    if (combo >= 0 && combo <= 3) {
      return "literal value " + combo;;
    }

    if (combo === 4) {
      return "register A (" + this.registers.a + ", #" + this.registers.a.toString(2) + ")";
    }

    if (combo === 5) {
      return "register B (" + this.registers.b + ", #" + this.registers.b.toString(2) + ")";
    }

    if (combo === 6) {
      return "register C (" + this.registers.c + ", #" + this.registers.c.toString(2) + ")";
    }

    throw new Error("Unrecognized combo " + combo);
  }

  printOutput() {
    console.log(this.output);
  }
}

export function modulo(num: number, wrap: number) {
  if (num < 0) {
    return (wrap + (num % wrap)) % wrap;
  }

  return num % wrap;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const parts = text.split("\n\n");
  const registerLines = parts[0].split("\n");
  const programLine = parts[1];

  const overwriteA = Math.pow(8, 15) + 6 + 8*0 + Math.pow(8, 3);
  console.log("A => " + overwriteA);
  const registers = new Registers(registerLines);

  const program = new Program(programLine, registers, overwriteA);

  console.log(registers);

  while (program.executeInstruction());

  console.log(registers);

  program.printOutput();

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