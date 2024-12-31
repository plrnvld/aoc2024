if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const parts = text.split("\n\n");

  const towels = parts[0].split(", ");
  const designs = parts[1].split("\n");

  console.log(`${towels.length} towels and ${designs.length} designs.`);
}
