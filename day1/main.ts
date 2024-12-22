const numberCount: { [key: number]: number } = {};

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines: string[] = text.split("\n");
  const left: number[] = [1000];
  const right: number[] = [1000];

  let index = 0;
  for (const line of lines) {
    const parts = line.split(" ");
    left[index] = parseInt(parts[0]);
    right[index] = parseInt(parts[3]);

    index++;
  }

  for (const rNum of right) {
    if (rNum in numberCount) {
      numberCount[rNum] = numberCount[rNum] + 1;
    } else {
      numberCount[rNum] = 1;
    }
  }

  let similarity = 0;

  for (let i = 0; i < 1000; i++) {
    const lNum = left[i];
    const score = lNum * (numberCount[lNum] ?? 0);
    similarity += score;
  }

  console.log(`Similarity = ${similarity}`);
}
