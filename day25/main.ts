function isKey(block: string): boolean {
  return block[0] === ".";
}

function isLock(block: string): boolean {
  return !isKey(block);
}

class Lock {
  heights: number[];

  constructor(lines: string[]) {
    this.heights = [];

    for (let i = 0; i < 5; i++) {
      let height = 0;
      let c = lines[height + 1][i];
      while (c !== ".") {
        height += 1;
        c = lines[height + 1][i];
      }
      this.heights.push(height);
    }
  }

  fits(key: Key): boolean {
    for (let i = 0; i < 5; i++) {
      if (this.heights[i] + key.heights[i] > 5)
        return false;
    }
    return true;
  }
}

class Key {
  heights: number[];

  constructor(lines: string[]) {
    this.heights = [];

    for (let i = 0; i < 5; i++) {
      let height = 0;
      let c = lines[5 - height][i];
      while (c !== ".") {
        height += 1;
        c = lines[5 - height][i];
      }
      this.heights.push(height);
    }
  }
}



if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const blocks = text.split("\n\n");

  const keys = blocks.filter((b) => isKey(b));
  const locks = blocks.filter((b) => isLock(b));
  console.log(
    `${blocks.length} blocks: ${keys.length} keys and ${locks.length} locks`,
  );

  const lockObjects = locks.map(line => line.split("\n")).map(lines => new Lock(lines));
  const keyObjects = keys.map(line => line.split("\n")).map(lines => new Key(lines));

  let fitting = 0;

  for (const key of keyObjects)
    for (const lock of lockObjects)
      if (lock.fits(key))
        fitting++;

  console.log(fitting);
}
