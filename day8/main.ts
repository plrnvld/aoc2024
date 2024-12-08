if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines: string[] = text.split("\n");

  console.log(lines.length);
}
