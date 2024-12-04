function readInstructions(line: string): number {
  const pattern = /mul\([0-9]+\,[0-9]+\)/g;
  const res = line.match(pattern);

  let sum = 0;

  if (res) {
    for (const group of res) {
      // console.log("group > " + group);
      const nums = group.match(/[0-9]+/g);

      if (nums) 
        sum += parseInt(nums[0]) * parseInt(nums[1]);
    }
  }
 
  return sum;
}

// mul(123,4)
if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines: string[] = text.split("\n");

  const total = lines.map(line => readInstructions(line)).reduce((a, b) => a + b, 0);

  console.log(total);
}
