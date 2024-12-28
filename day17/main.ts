import { PartialA } from "./partial_a.ts";
import { Registers, Program } from "./program.ts";




if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const parts = text.split("\n\n");
  const registerLines = parts[0].split("\n");
  const programLine = parts[1];
  const instructions = programLine.split(" ")[1].split(",").map((t) =>
    parseInt(t)
  );

  // const overwriteA = Math.pow(8, 15);
  const originalRegisters = new Registers(registerLines);
  const expectedAnswer = instructions;

  const queue: PartialA[] = [];

  PartialA.newPartialAnswer().expandAnswers().flatMap(a => a.expandAnswers()).forEach((a) => queue.push(a));

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
    const numToCheck = Math.max(partialAnswer.filled -8, 0);
    const isPartialMatch = program.checkOutput(expectedAnswer, numToCheck);

    // console.log(
    //   `     > Partial(${partialAnswer.calcRegister()}) Expected = ${expectedAnswer} Actual = ${program.output}. Checking ${numToCheck}`,
    // );

    if (isPartialMatch) {
      if (numToCheck > 1) {
        console.log(
          `>>> partial match. (${numToCheck}) Expected ${expectedAnswer} Actual ${program.output} Check = ${numToCheck}`,
        );
      }

      if (partialAnswer.isFilled()) {
        solutions.push(partialAnswer);
      } else {
        // console.log("Adding new partial answers **** ");
        const newAnswers = partialAnswer.expandAnswers();
        newAnswers.forEach((a) => queue.push(a));
      }
    }
  }

  console.log("Solution count = " + solutions.length);
  for (const solution of solutions) {
    console.log(solution.calcRegister());
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
