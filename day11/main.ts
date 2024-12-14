if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const stones = text.split(" ").map((t) => parseInt(t));

  console.log(stones);
}
