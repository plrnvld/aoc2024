import { assertEquals } from "@std/assert";
import { combineNumbers, Equation, isSolvable } from "./main.ts";

Deno.test(function combineTest() {
  assertEquals(combineNumbers([23, 45]), 2345);
});

Deno.test(function isSolvableTest() {
  const equation = new Equation(7290, [6, 8, 6, 15]);
  assertEquals(isSolvable(equation), true);
});
