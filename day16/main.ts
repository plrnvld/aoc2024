if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");
  console.log(lines.length);
}
