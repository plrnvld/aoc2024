function findNumBlocks(diskMap: string) {
  return (diskMap.length + 1) / 2;
}

function freeSpaceAfter(blockId: number, diskMap: string) {
  const freeSpaceIndex = 1 + blockId * 2;

  if (freeSpaceIndex == diskMap.length) {
    return 0; // After last block there is no space
  }

  if (freeSpaceIndex > diskMap.length) {
    throw new Error(`freeSpaceIndex ${freeSpaceIndex} out of bounds`);
  }

  return parseInt(diskMap[freeSpaceIndex]);
}

function blockSize(blockId: number, diskMap: string) {
  const blockIndex = blockId * 2;

  if (blockIndex >= diskMap.length) {
    throw new Error(`blockIndex ${blockIndex} out of bounds`);
  }

  return parseInt(diskMap[blockIndex]);
}

if (import.meta.main) {
  const diskMap = await Deno.readTextFile("input");
  const numBlocks = findNumBlocks(diskMap);

  for (let i = 0; i < numBlocks; i++) {
    console.log(
      `Block ${i.toString().repeat(blockSize(i, diskMap))} trailed by ${
        freeSpaceAfter(i, diskMap)
      } spaces.`,
    );
  }

  console.log();

  let righBlockId = numBlocks - 1;
  let leftBlockId = 0;
  let rightBlockRemaining = blockSize(righBlockId, diskMap);
  let rightIndex = diskMap.length - 1;
  let leftIndex = 0;
  let checkSum = 0;

  while (leftBlockId <= righBlockId) { // Don't count the last right block items twice
    for (let j = 0; j < blockSize(leftBlockId, diskMap) && (leftBlockId !== righBlockId || j < rightBlockRemaining); j++) {
      const addLeft = leftIndex * leftBlockId;

      console.log(`L: Adding ${leftIndex} * ${leftBlockId} = ${addLeft}`);

      if (leftBlockId === righBlockId) {
        rightBlockRemaining--;
      }

      checkSum += addLeft;
      leftIndex++;
    }

    console.log("> Finished filling " + leftBlockId);
    leftBlockId++;


    if (leftBlockId < righBlockId) {
      for (
        let k = 0;
        k < freeSpaceAfter(leftBlockId-1, diskMap);
        k++
      ) {
        if (rightBlockRemaining == 0) {
          righBlockId--;
          rightBlockRemaining = blockSize(righBlockId, diskMap);
        }

        const addRight = leftIndex * righBlockId;

        console.log(`R: Adding ${leftIndex} * ${righBlockId} = ${addRight}`);

        checkSum += addRight;
        rightBlockRemaining--;
        leftIndex++;
        rightIndex--;
      }
    } else { // final block
      for (let m = 0; m < rightBlockRemaining; m++) {
        const addFinal = leftIndex * righBlockId;

        console.log(`FR: Adding ${leftIndex} * ${righBlockId} = ${addFinal}`);

        checkSum += addFinal;

        rightBlockRemaining--;
        leftIndex++;
      }

    }
  }

  console.log(checkSum);
}
