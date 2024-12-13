class Block {
  blockId: number;
  index: number;
  size: number;
  freeSpacesAfter: number;

  constructor(
    blockId: number,
    index: number,
    size: number,
    freeSpacesAfter: number,
  ) {
    this.blockId = blockId;
    this.index = index;
    this.size = size;
    this.freeSpacesAfter = freeSpacesAfter;
  }
}

class GapPosition {
  lastBlockId: number;
  gapStartIndex: number;

  constructor(lastBlockId: number, gapStartIndex: number) {
    this.lastBlockId = lastBlockId;
    this.gapStartIndex = gapStartIndex;
  }
}

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

function getBlockSize(blockId: number, diskMap: string) {
  const blockIndex = blockId * 2;

  if (blockIndex >= diskMap.length) {
    throw new Error(`blockIndex ${blockIndex} out of bounds`);
  }

  return parseInt(diskMap[blockIndex]);
}

function moveBlockAfter(blockToMove: Block, afterBlockId: number, allBlocks: Block[]): Block[] {
  const newBlocksList: Block[] = [];

  for (let i = 0; i < allBlocks.length; i++) {
    const currBlock = allBlocks[i];
    if (currBlock.blockId !== blockToMove.blockId) {
      newBlocksList.push(currBlock)
    }

    if (currBlock.blockId === afterBlockId) {
      if (currBlock.freeSpacesAfter < blockToMove.size)
        throw new Error(`Block ${blockToMove} does not fit after ${currBlock}`);
      
      blockToMove.freeSpacesAfter = currBlock.freeSpacesAfter - blockToMove.size;
      newBlocksList.push(blockToMove);

      currBlock.freeSpacesAfter = 0;
    }
  }

  return newBlocksList;
}

if (import.meta.main) {
  const diskMap = await Deno.readTextFile("example");
  const numBlocks = findNumBlocks(diskMap);

  const blocks: Block[] = [];
  let currIndex = 0;

  for (let i = 0; i < numBlocks; i++) {
    const blockSize = getBlockSize(i, diskMap);
    const gapSize = freeSpaceAfter(i, diskMap);
    const newBlock = new Block(i, currIndex, blockSize, gapSize);
    blocks.push(newBlock);
    currIndex += blockSize + gapSize;

    console.log(newBlock);
  }

  console.log(blocks.length);
}
