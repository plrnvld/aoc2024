type Controls = "up" | "down" | "left" | "right" | "activate"

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines = text.split("\n");

  console.log(lines.length);
}