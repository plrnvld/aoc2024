function isOrdered(line: number[], notAllowedAfterMap: Map<number, number[]>) {
  for (let i = 0; i < line.length; i++) {
    const curr = line[i];
    const tail = line.slice(i + 1);

    const notAllowedAfter = notAllowedAfterMap.get(curr) ?? [];

    for (const tailNum of tail) {
      if (notAllowedAfter.indexOf(tailNum) !== -1) {
        return false;
      }
    }
  }

  return true;
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines: string[] = text.split("\n");

  const emptyIndex = lines.indexOf("");

  const orderingLines = lines.slice(0, emptyIndex);

  const notAllowedAfterMap = new Map<number, number[]>();
  for (const line of orderingLines) {
    const parts = line.split("|");
    const goBefore = parseInt(parts[0]);
    const goAfter = parseInt(parts[1]);

    const notAllowed = notAllowedAfterMap.get(goAfter);

    if (notAllowed) {
      notAllowed.push(goBefore);
      notAllowedAfterMap.set(goAfter, notAllowed);
    } else {
      notAllowedAfterMap.set(goAfter, [goBefore]);
    }
  }

  for (const key of notAllowedAfterMap.keys()) {
    const values = notAllowedAfterMap.get(key);

    console.log(`[${key}]: ${values}`);
  }

  const checkLines = lines.slice(emptyIndex + 1)
    .map((l) =>
      l.split(",")
        .map((t) => parseInt(t))
    );

  let count = 0;

  for (const line of checkLines) {
    if (isOrdered(line, notAllowedAfterMap)) {
      const middleIndex = (line.length - 1) / 2;
      count += line[middleIndex];
    }
  }

  console.log(count);
}
