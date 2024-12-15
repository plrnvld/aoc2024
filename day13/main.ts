if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const blocks = text.split("\n\n");

  console.log(blocks.length);
}
