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

  toString() {
    return this.blockId.toString().repeat(this.size) +
      ".".repeat(this.freeSpacesAfter);
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
  blockBeforeBlockToMove: Block | undefined,
  afterBlockId: number,
  allBlocks: Block[],
): Block[] {
  const newBlocksList: Block[] = [];

  for (let i = 0; i < allBlocks.length; i++) {
    const currBlock = allBlocks[i];
    if (currBlock.blockId !== blockToMove.blockId) {
      newBlocksList.push(currBlock);
    }

    if (currBlock.blockId === afterBlockId) {
      if (currBlock.freeSpacesAfter < blockToMove.size) {
        throw new Error(`Block ${blockToMove} does not fit after ${currBlock}`);
      }

      const originalFreeSpaceAfter = blockToMove.freeSpacesAfter;

      blockToMove.freeSpacesAfter = currBlock.freeSpacesAfter -
        blockToMove.size;
      blockToMove.index = currBlock.index + currBlock.size;

      if (blockBeforeBlockToMove) {
        blockBeforeBlockToMove.freeSpacesAfter += blockToMove.size +
          originalFreeSpaceAfter;
      }

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
): number | undefined {
  for (let i = startBlockIndex; blocks[i] !== blockToMove; i++) {
    const currBlock = blocks[i];
    if (currBlock.freeSpacesAfter >= blockToMove.size) {
      return currBlock.blockId;
    }
  }

  return undefined;
}

function findBlockWithIdAndPrevBlock(
  blockId: number,
  blocks: Block[],
): [Block, Block | undefined] {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].blockId === blockId) {
      if (i === 0) {
        return [blocks[0], undefined];
      } else {
        return [blocks[i], blocks[i - 1]];
      }
    }
  }

  throw new Error(`Cannot find ${blockId}`);
}

if (import.meta.main) {
  const diskMap = await Deno.readTextFile("input");
  const numBlocks = findNumBlocks(diskMap);

  let blocks: Block[] = [];
  let currIndex = 0;

  for (let i = 0; i < numBlocks; i++) {
    const blockSize = getBlockSize(i, diskMap);
    const gapSize = freeSpaceAfter(i, diskMap);
    const newBlock = new Block(i, currIndex, blockSize, gapSize);
    blocks.push(newBlock);
    currIndex += blockSize + gapSize;
  }

  for (let j = numBlocks - 1; j >= 0; j--) {
    const [currBlock, prevBlock] = findBlockWithIdAndPrevBlock(j, blocks);
    const moveAfter = findBlockToMoveAfter(currBlock, blocks, 0);

    if (moveAfter !== undefined) {
      blocks = moveBlockAfter(currBlock, prevBlock, moveAfter, blocks);
    }
  }

  let checksum = 0;

  let line = "";

  for (const bl of blocks) {
    checksum += bl.checksumPart;
    line += bl.toString();
  }

  console.log();

  console.log(checksum);
}

// 9816325965332 too high
// 6418529554426 too high
// 6418529470362
