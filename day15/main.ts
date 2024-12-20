if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const parts = text.split("\n\n");
  const boardLines = parts[0].split("\n");
  const moves = parts[1];

  console.log(boardLines.length);
  console.log(moves);
}
