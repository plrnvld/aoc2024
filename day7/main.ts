export class Equation {
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

export function concatNumbers(numbers: number[]): number {
  const texts: string[] = numbers.map((n) => n.toString());
  return parseInt(texts.join(""));
}

function parseEquation(line: string): Equation {
  const parts = line.split(": ");
  const target = parseInt(parts[0]);
  const numbers = parts[1].split(" ").map((t) => parseInt(t));

  return new Equation(target, numbers);
}

export function isSolvable(equation: Equation) {
  const stack: SubResult[] = [];

  stack.push(new SubResult(concatNumbers(equation.numbers.slice(0, 1)), 1));

  while (stack.length > 0) {
    const curr = stack.pop()!;

    if (curr.isFinished(equation.numbers.length)) {
      if (curr.currentValue === equation.target) {
        return true;
      }
    } else if (curr.currentValue <= equation.target) {
      const nextNumber = equation.numbers[curr.nextIndex];

      stack.push(
        new SubResult(
          concatNumbers([curr.currentValue, nextNumber]),
          curr.nextIndex + 1,
        ),
      );
      stack.push(
        new SubResult(
          curr.currentValue + nextNumber,
          curr.nextIndex + 1,
        ),
      );
      stack.push(
        new SubResult(
          curr.currentValue * nextNumber,
          curr.nextIndex + 1,
        ),
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

// Part 1:
// 5030892084481
//
// Part 2:
// 5069305346448 too low
// 91377448692324 too high
// 91377448644679
