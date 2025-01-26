function isKey(block: string): boolean {
  return block[0] === ".";
}

function isLock(block: string): boolean {
  return !isKey(block);
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const blocks = text.split("\n\n");

  const keys = blocks.filter((b) => isKey(b));
  const locks = blocks.filter((b) => isLock(b));
  console.log(
    `${blocks.length} blocks: ${keys.length} keys and ${locks.length} locks`,
  );
}
