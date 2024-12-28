export { PartialA };
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
    
    for (let right = 0; right < 8; right++) {
      const bytes = [...this.registerABytes];
      const rightPos = bytes.length - 1 - this.filled;
      bytes[rightPos] = right;

      expanded.push(new PartialA(bytes, nextFilled));
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

      base = base * BigInt(8);
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