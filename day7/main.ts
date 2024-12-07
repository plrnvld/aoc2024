class Equation {
  target: number;
  numbers: number[];

  constructor(target: number, numbers: number[]) {
    this.target = target;
    this.numbers = numbers;
  }
}

class SubResult {
  currentValue: number;
  nextIndex: number;

  constructor(currentValue: number, nextIndex: number) {
    this.currentValue = currentValue;
    this.nextIndex = nextIndex;
  }

  isFinished(numberCount: number) {
    return this.nextIndex >= numberCount;
  }
}

function parseEquation(line: string): Equation {
  const parts = line.split(": ");
  const target = parseInt(parts[0]);
  const numbers = parts[1].split(" ").map((t) => parseInt(t));

  return new Equation(target, numbers);
}

function isSolvable(equation: Equation) {
  const stack: SubResult[] = [];

  stack.push(new SubResult(equation.numbers[0], 1));

  while (stack.length > 0) {
    const curr = stack.pop()!;

    if (curr.isFinished(equation.numbers.length)) {
      if (curr.currentValue === equation.target) {
        console.log("Target " + equation.target + " can be solved.");
        return true;
      }
    } else if (curr.currentValue <= equation.target) {
      const nextNumber = equation.numbers[curr.nextIndex];
      stack.push(
        new SubResult(curr.currentValue + nextNumber, curr.nextIndex + 1),
      );
      stack.push(
        new SubResult(curr.currentValue * nextNumber, curr.nextIndex + 1),
      );
    }
  }

  return false;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines: string[] = text.split("\n");
  const equations = lines.map((l) => parseEquation(l));

  let sum = 0;

  for (const equation of equations) {
    if (isSolvable(equation)) {
      sum += equation.target;
    }
  }

  console.log(sum);
}
