

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines: string[] = text.split("\n");

  const obstacles = new Set<[number, number]>();

  let position: [number, number] | undefined = undefined;

  for (let row = 0; row < lines.length; row++) {
    for (let col = 0; col < lines[row].length; col++) {
      const elem = lines[row].charAt(col);

      if (elem === "#")
        obstacles.add([col, row]);
      else if (elem === "^")
        position = [col, row];
    }
  }

  if (!position)
    throw new Error("No position found");

  console.log("Obstacle count = " + obstacles.size);
}
