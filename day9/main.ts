
function findNumBlocks(diskMap: string) {
  return (diskMap.length + 1) / 2;
}

function freeSpaceAfter(blockId: number, diskMap: string) {
  const freeSpaceIndex = 1 + blockId * 2;

  if (freeSpaceIndex == diskMap.length)
    return 0; // After last block there is no space

  if (freeSpaceIndex > diskMap.length)
    throw new Error(`freeSpaceIndex ${freeSpaceIndex} out of bounds`);
  
  return parseInt(diskMap[freeSpaceIndex]);
}

function blockSize(blockId: number, diskMap: string) {
  const blockIndex = blockId * 2;

  if (blockIndex >= diskMap.length)
    throw new Error(`blockIndex ${blockIndex} out of bounds`);
  
  return parseInt(diskMap[blockIndex]);
}

if (import.meta.main) {
  const diskMap = await Deno.readTextFile("example");
  const numBlocks = findNumBlocks(diskMap);
  
  for (let i = 0; i < numBlocks; i++) {
    console.log(`Block ${i.toString().repeat(blockSize(i, diskMap))} trailed by ${freeSpaceAfter(i, diskMap)} spaces.`)
  }

  let righBlockId = numBlocks - 1;
  let leftBlockId = 0;
  let rightBlockRemaining = blockSize(righBlockId, diskMap);
  let rightIndex = diskMap.length - 1;
  let leftIndex = 0;
  let checkSum = 0;

  while (leftBlockId <= righBlockId) { // Don't count the last right block items twice
    for (let j = 0; j < blockSize(leftBlockId, diskMap); j++) {
      const addLeft = leftIndex * leftBlockId;

      console.log(`Adding ${leftIndex} * ${leftBlockId} = ${addLeft}`)

      checkSum += addLeft
      leftIndex++;
    }

    leftBlockId++;

    for (let k = 0; k < freeSpaceAfter(leftBlockId, diskMap) && leftIndex < rightIndex; k++) {
      if (rightBlockRemaining == 0) {
        righBlockId--;
        rightBlockRemaining = blockSize(righBlockId, diskMap);
      }

      const addRight = leftIndex * righBlockId;

      console.log(`Adding ${leftIndex} * ${righBlockId} = ${addRight}`)

      checkSum += addRight
      rightBlockRemaining--;
      leftIndex++;
      rightIndex--;
    }
  }

  console.log(checkSum);
}
