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

  get checksumPart() {
    let checksum = 0;
    for (let i = 0; i < this.size; i++) {
      checksum += (this.index + i) * this.blockId;
    }

    return checksum;
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

function moveBlockAfter(
  blockToMove: Block,
  blockBeforeBlockToMove: Block,
  afterBlockId: number,
  allBlocks: Block[],
): Block[] {
  console.log("*** moveBlockAfter called ***");

  const newBlocksList: Block[] = [];

  console.log(
    `---> Moving block ${blockToMove.blockId} after block ${afterBlockId}`,
  );

  for (let i = 0; i < allBlocks.length; i++) {
    const currBlock = allBlocks[i];
    if (currBlock.blockId !== blockToMove.blockId) {
      newBlocksList.push(currBlock);
    }

    if (currBlock.blockId === afterBlockId) {
      if (currBlock.freeSpacesAfter < blockToMove.size) {
        throw new Error(`Block ${blockToMove} does not fit after ${currBlock}`);
      }

      blockToMove.freeSpacesAfter = currBlock.freeSpacesAfter -
        blockToMove.size;
      blockToMove.index = currBlock.index + currBlock.size;

      blockBeforeBlockToMove.freeSpacesAfter += blockToMove.size +
        blockToMove.freeSpacesAfter;

      newBlocksList.push(blockToMove);

      currBlock.freeSpacesAfter = 0;
    }
  }

  return newBlocksList;
}

function findBlockToMoveAfter(
  blockToMove: Block,
  blocks: Block[],
  startBlockIndex: number,
  endBlockIndex: number,
): number | undefined {
  console.log(`> Trying to move block ${blockToMove.blockId}`);

  for (let i = startBlockIndex; i < endBlockIndex; i++) {
    const currBlock = blocks[i];
    if (currBlock.freeSpacesAfter >= blockToMove.size) {
      console.log(`>>> New spot after ${currBlock.blockId} found.`);
      return currBlock.blockId;
    }
  }

  console.log(`> Block ${blockToMove.blockId} cannot be moved`);
  return undefined;
}

if (import.meta.main) {
  const diskMap = await Deno.readTextFile("example");
  const numBlocks = findNumBlocks(diskMap);

  let blocks: Block[] = [];
  let currIndex = 0;

  for (let i = 0; i < numBlocks; i++) {
    const blockSize = getBlockSize(i, diskMap);
    const gapSize = freeSpaceAfter(i, diskMap);
    const newBlock = new Block(i, currIndex, blockSize, gapSize);
    blocks.push(newBlock);
    currIndex += blockSize + gapSize;

    // console.log(newBlock);
  }

  for (let j = numBlocks - 1; j >= 0; j--) {
    const currBlock = blocks[j];
    const moveAfter = findBlockToMoveAfter(currBlock, blocks, 0, j);

    console.log("    >>> MOVING '" + moveAfter + "'");

    if (moveAfter !== undefined) {
      blocks = moveBlockAfter(currBlock, blocks[j - 1], moveAfter, blocks);
    } else {
      console.log("WHYWHYWHY!");
    }
  }

  let checksum = 0;

  for (const bl of blocks) {
    console.log(bl);
    checksum += bl.checksumPart;
  }

  console.log(checksum);
}

// 9816325965332 too high
