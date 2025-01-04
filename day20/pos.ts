export class Pos {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get key(): number {
    return this.y * 1000 + this.x;
  }

  get left(): Pos {
    return new Pos(this.x - 1, this.y);
  }

  get right(): Pos {
    return new Pos(this.x + 1, this.y);
  }

  get up(): Pos {
    return new Pos(this.x, this.y - 1);
  }

  get down(): Pos {
    return new Pos(this.x, this.y + 1);
  }

  manhattanDistanceTo(other: Pos): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  static fromLine(line: string): Pos {
    const parts = line.split(",");
    const x = parseInt(parts[0]);
    const y = parseInt(parts[1]);

    return new Pos(x, y);
  }

  static fromKey(key: number): Pos {
    const x = key % 1000;
    const y = (key - x) / 1000;
    return new Pos(x, y);
  }
}
