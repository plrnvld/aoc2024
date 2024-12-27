import { Registers } from "./registers.ts";

  export class Program {
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
      // console.log(` > Check(${checkFromSide})`);
  
      if (checkFromSide === 0) {
        return true;
      }
  
      // if (this.output.length !== expected.length) {
      //   return false;
      // }
  
      for (let i = 0; i < checkFromSide; i++) {
        // const left = i;
        
        // if (
        //   this.output[left] !== expected[left] ||
        //   this.output[right] !== expected[right]
        // ) {
        //   return false;
        // }
  
        if (this.output[this.output.length - 1 - i] !== expected[expected.length - 1 - i]) { // #############
          // console.log("Different number, expected " + expected[expected.length - 1 - i] + " but was " + this.output[this.output.length - 1 - i]);
          return false;
        }
      }
  
      // console.log("> Match!")
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
      const result: bigint = this.registers.a /
        BigInt(Math.pow(2, Number(this.getComboValue(combo))));
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
      const result = this.registers.a /
        BigInt(Math.pow(2, Number(this.getComboValue(combo))));
      this.registers.b = result;
    }
  
    // Opcode 7
    cdv(combo: bigint) { // truncated( A / 2^combo ) --> C
      const result: bigint = BigInt(Math.trunc(
        Number(this.registers.a) /
          Number(Math.pow(2, Number(this.getComboValue(combo)))),
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

export { Registers };
