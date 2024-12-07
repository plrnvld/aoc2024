class Equation {
  target: number;
  numbers: number[];
  
  constructor(target: number, numbers: number[]) {
    this.target = target;
    this.numbers = numbers;
  }
}

function parseEquation(line: string): Equation {
  return new Equation(0, []);
}

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines: string[] = text.split("\n");
  const equations = lines.map(l => parseEquation(l));

  console.log(equations.length);
}
