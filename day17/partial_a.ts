export { PartialA };
class PartialA {
  registerABytes: number[];
  filledLeft: number;
  filledRight: number;

  constructor(registerABytes: number[], filledLeft: number, filledRight: number) {
    this.registerABytes = registerABytes;
    this.filledLeft = filledLeft;
    this.filledRight = filledRight;
  }

  expandLeft(): PartialA[] {
    const expanded: PartialA[] = [];

    const nextFilled = this.filledLeft + 1;

    for (let expandWith = 0; expandWith < 8; expandWith++) {
      const bytes = [...this.registerABytes];
      bytes[this.filledLeft] = expandWith;

      
      expanded.push(new PartialA(bytes, nextFilled, this.filledRight));
    }

    return expanded;
  }

  expandRight(): PartialA[] {
    const expanded: PartialA[] = [];

    const nextFilled = this.filledRight + 1;

    for (let expandWith = 0; expandWith < 8; expandWith++) {
      const bytes = [...this.registerABytes];
      bytes[bytes.length - 1 - this.filledRight] = expandWith;

      
      expanded.push(new PartialA(bytes, this.filledLeft, nextFilled));
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
    return this.filledLeft + this.filledRight === 16; // ########
  }

  static newPartialAnswer() {
    return new PartialA(Array(16), 0, 0);
  }
}