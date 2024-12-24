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

  constructor(programLine: string) {
    this.instructions = programLine.split(" ")[1].split(",").map(t => parseInt(t));
  }

  adv(combo: number) { // truncated( A / 2^combo ) --> A
    // ###
  }

  bxl(combo: number) { // B `xor` literal --> B
    // ###
  }

  bst(combo: number) { // combo `modulo` 8 --> B
    // ###
  }

  jnz(combo: number) { // if (A == 2) then nothing, else jump to literal, if it jumps, dont increase pointer
    // ###
  }

  bxc(combo: number) { // B `xor` C --> B (ignore operand)
    // ###
  }

  out(combo: number) { // combo `modulo` 8 --> output (multiple outputs separated by comma's)
    // ###
  }

  bdv(combo: number) { // truncated( A / 2^combo ) --> B
    // ###
  }

  cdv(combo: number) { // truncated( A / 2^combo ) --> C
    // ###
  }
}

export function modulo(num: number, wrap: number) {
  if (num < 0) {
    return (wrap + (num % wrap)) % wrap;
  }

  return num % wrap;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const parts = text.split("\n\n");
  const registerLines = parts[0].split("\n");
  const programLine = parts[1];

  const registers = new Registers(registerLines);
  const program = new Program(programLine);

  console.log(registers);
  console.log(program);
}
