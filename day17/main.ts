import { PartialA } from "./partial_a.ts";
import { Program, Registers } from "./program.ts";

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const parts = text.split("\n\n");
  const registerLines = parts[0].split("\n");
  const programLine = parts[1];
  const instructions = programLine.split(" ")[1].split(",").map((t) =>
    parseInt(t)
  );

  const originalRegisters = new Registers(registerLines);
  const expectedAnswer = instructions;

  const queue: PartialA[] = [];

  PartialA.newPartialAnswer().expandLeft().flatMap((a) => a.expandRight())
    .forEach((a) => queue.push(a));

  const solutions: PartialA[] = [];

  while (queue.length > 0) {
    const partialAnswer = queue.pop()!;
    const registers = structuredClone(originalRegisters);
    const program = new Program(
      instructions,
      registers,
      partialAnswer.calcRegister(),
    );
    program.executeAllInstructions();
    const numToCheck = Math.max(
      partialAnswer.filledLeft + partialAnswer.filledRight - 4,
      0,
    );

    const isPartialMatch = program.checkOutput(expectedAnswer, numToCheck);

    console.log(
      `> Expected = ${expectedAnswer} Actual = ${program.output}. [Check ${numToCheck}]`,
    );

    if (isPartialMatch) {
      if (partialAnswer.isFilled()) {
        if (program.checkOutput(expectedAnswer, 16)) {
          solutions.push(partialAnswer);
        }
      } else {
        if (Math.random() > 0.5) {
          partialAnswer.expandLeft().forEach((a) => queue.push(a));
        } else {
          partialAnswer.expandRight().forEach((a) => queue.push(a));
        }
      }
    }
  }

  console.log("\nSolution count = " + solutions.length);
  for (
    const solution of solutions.toSorted((x, y) =>
      Number(x.calcRegister() - y.calcRegister())
    )
  ) {
    const programToCheck = new Program(
      instructions,
      originalRegisters,
      solution.calcRegister(),
    );
    programToCheck.executeAllInstructions();
    const outputForChecking = programToCheck.output;
    console.log(solution.calcRegister() + " OUTPUT: " + outputForChecking);
  }

  // Input to aim for
  // 2,4,1,1,7,5,1,5,0,3,4,3,5,5,3,0
  // (the answer outputs 16 values)

  // (2) bst 'register A `modulo` 8 --> B' (B will be between 0 and 7) (overwrites B)
  // (1) bxl 'literal 1: register B `xor` 000000001 --> B' (0 -> 1, 1 -> 0, 2 -> 3, 3 -> 2, 4 -> 5, 5 -> 4, 6 -> 7, 7 -> 6)
  // (7) cdv 'register B: truncated(A / 2^register B) --> C' (most of the time when A is big this will be a power of 4, so ending in binary 100) (overwrites C)
  // (1) bxl 'literal 5: register B `xor` 000000101 --> B' (0 -> 5, 1 -> 4, 2 -> 7, 3 -> 6, 4 -> 1, 5 -> 0, 6 -> 3, 7 -> 2)

  // (0) adv 'literal 3' (always divides by 8): 'truncated(register A / 8) --> A' (divide the A counter by 8)

  // (4) bxc 'ignores 3': register B `xor` register C --> B (Most of the time, when A is big, C ends in binary 100, then `xor` flips the 4)
  // (5) out 'register B `modulo` 8': output register B `modulo` 8 (B is always smaller than 8, it will just output B)

  // (3) jnz 'literal 0 if A != 0': start over when A is not 0

  // >> Analysis

  // (1) bxl 'literal 1: register B `xor` 000000001 --> B' (0 -> 1, 1 -> 0, 2 -> 3, 3 -> 2, 4 -> 5, 5 -> 4, 6 -> 7, 7 -> 6)
  // (1) bxl 'literal 5: register B `xor` 000000101 --> B' (0 -> 5, 1 -> 4, 2 -> 7, 3 -> 6, 4 -> 1, 5 -> 0, 6 -> 3, 7 -> 2)

  // Combined (0 -> 4) (1 -> 5) (2 -> 6) (3 -> 7) (4 -> 0) (5 -> 1) (6 -> 2) (7 -> 3)
}

// 164542234324925 too high
// 164545346498493 too high
// 164545346498493
// 164545346498493
// 164545346498237 too high
// 164545346498237
//
// 164542125272765 victory
