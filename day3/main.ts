if (import.meta.main) {
  let isActive = true;

  function readInstructions(line: string): number {
    const pattern = /mul\([0-9]+\,[0-9]+\)|do\(\)|don\'t\(\)/g;
    const res = line.match(pattern);

    const mulsThatCount: string[] = [];

    let sum = 0;

    if (res) {
      for (const resPart of res) {
        if (resPart.startsWith("mul") && isActive) {
          mulsThatCount.push(resPart);
        } else if (resPart === "don't()") {
          isActive = false;
        } else if (resPart === "do()") {
          isActive = true;
        }
      }

      for (const group of mulsThatCount) {
        const nums = group.match(/[0-9]+/g);

        if (nums) {
          sum += parseInt(nums[0]) * parseInt(nums[1]);
        }
      }
    }

    return sum;
  }

  const text = await Deno.readTextFile("input");
  const lines: string[] = text.split("\n");

  const total = lines.map((line) => readInstructions(line)).reduce(
    (a, b) => a + b,
    0,
  );

  console.log(total);
}
