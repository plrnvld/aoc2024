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
  
  const leftSorted = left.sort();
  const rightSorted = right.sort();
  let sum = 0;

  for (let i = 0; i < 1000; i++) {
    const diff = Math.abs(leftSorted[i] - rightSorted[i]);
    sum += diff;
  }

  console.log(`Sum = ${sum}`);
}
