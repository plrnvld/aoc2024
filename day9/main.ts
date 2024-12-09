if (import.meta.main) {
  const text = await Deno.readTextFile("input");

  console.log(text);
}
