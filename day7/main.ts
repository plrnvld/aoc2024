class Equation {
  target: number;
  numbers: number[];
  
  constructor(target: number, numbers: number[]) {
    this.target = target;
    this.numbers = numbers;
  }
}

function parseEquation(line: string): Equation {
  const parts = line.split(": ");
  const target = parseInt(parts[0]);
  const numbers = parts[1].split(" ").map(t => parseInt(t));

  return new Equation(target, numbers);
}

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines: string[] = text.split("\n");
  const equations = lines.map(l => parseEquation(l));

  console.log(equations);
}
