export function cutInPartsEndingOnA(sequencePart: SequencePart, minCutSize: number): SequencePart[] {
  const parts: SequencePart[] = [];
  let remaining = sequencePart.part;

  let nextSliceIndex = getNextSliceIndex(remaining, minCutSize);

  while (remaining.length > 0) {
    const nextPart = new SequencePart(remaining.slice(0, nextSliceIndex), sequencePart.robotLevel, true);
    remaining = remaining.slice(nextSliceIndex);
    parts.push(nextPart);

    nextSliceIndex = getNextSliceIndex(remaining, minCutSize);
  }

  return parts;
}

export class SequencePart {
  robotLevel: number;
  part: string;
  isCut: boolean;

  constructor(part: string, robotLevel: number, isCut: boolean) {
    this.part = part;
    this.robotLevel = robotLevel;
    this.isCut = isCut;
  }
}

function getNextSliceIndex(input: string, minPartSize: number): number {
  if (input.length <= minPartSize) {
    return input.length;
  }

  const partAfterMinSize = input.slice(minPartSize);
  const indexOfA = partAfterMinSize.indexOf("A");

  if (indexOfA === -1) {
    return input.length;
  }

  return minPartSize + indexOfA + 1; // Include the A
}
