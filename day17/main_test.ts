import { assertEquals } from "@std/assert";
import { PartialA } from "./partial_a.ts";

Deno.test(function partialInit() {
  const newPartial = PartialA.newPartialAnswer();
  assertEquals(newPartial.filled, 0);

  const nextPartials = newPartial.expandAnswers();
  assertEquals(nextPartials.length, 8);

  for (let i = 0; i < 8; i++) {
    assertEquals(nextPartials[i].registerABytes[15], i);
  }

  const fourthNext = nextPartials[4];
  assertEquals(fourthNext.calcRegister(), 4n);

  const fourthNextNexts = fourthNext.expandAnswers();
  assertEquals(fourthNextNexts.length, 8);


  assertEquals(fourthNextNexts[3].calcRegister(), 8n*3n + 4n);

});


Deno.test(function calcRegisters() {
  const undefinedArray = Array(16);
  undefinedArray[0] = 7;
  const significantPartial = new PartialA(undefinedArray, 1);

  assertEquals(significantPartial.calcRegister(), BigInt(Math.pow(8, 15)) * 7n);

});
