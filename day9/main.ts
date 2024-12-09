
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

  console.log(findNumBlocks(diskMap));
}
