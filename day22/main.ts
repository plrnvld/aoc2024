// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");

  console.log(lines.length);

}
