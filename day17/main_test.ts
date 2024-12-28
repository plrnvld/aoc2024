import { assertEquals } from "@std/assert";
import { PartialA } from "./partial_a.ts";

Deno.test(function partialInit() {
  const newPartial = PartialA.newPartialAnswer();
  assertEquals(newPartial.filledLeft, 0);

  const nextPartials = newPartial.expandLeft();
  assertEquals(nextPartials.length, 8);

  for (let i = 0; i < 8; i++) {
    assertEquals(nextPartials[i].registerABytes[0], i);
  }

  const fourthNext = nextPartials[4];
  assertEquals(fourthNext.calcRegister(), 4n * BigInt(Math.pow(8, 15)));

  const fourthNextNexts = fourthNext.expandLeft();
  assertEquals(fourthNextNexts.length, 8);

  assertEquals(
    fourthNextNexts[3].calcRegister(),
    4n * BigInt(Math.pow(8, 15)) + 3n * BigInt(Math.pow(8, 14)),
  );

  const nextNextRightNexts = fourthNextNexts[3].expandRight();
  assertEquals(
    nextNextRightNexts[6].calcRegister(),
    4n * BigInt(Math.pow(8, 15)) + 3n * BigInt(Math.pow(8, 14)) + 6n,
  );
});

Deno.test(function calcRegisters() {
  const undefinedArray = Array(16);
  undefinedArray[0] = 7;
  const significantPartial = new PartialA(undefinedArray, 1, 0);

  assertEquals(significantPartial.calcRegister(), BigInt(Math.pow(8, 15)) * 7n);
});
