export class Registers {
    a: bigint;
    b: bigint;
    c: bigint;
  
    constructor(registerLines: string[]) {
      this.a = this.#readRegister(registerLines[0]);
      this.b = this.#readRegister(registerLines[1]);
      this.c = this.#readRegister(registerLines[2]);
    }
  
    #readRegister(line: string): bigint {
      return BigInt(line.split(" ")[2]);
    }
  }
  
