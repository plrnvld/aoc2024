if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const mapLines = text.split("\n");
  console.log(mapLines.length);
}
