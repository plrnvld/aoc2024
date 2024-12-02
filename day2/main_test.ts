import { assertEquals } from "@std/assert";
import { inc, dec, diffLim } from "./main.ts";

Deno.test(function incBasicTest() {
  assertEquals(inc([1, 2, 3], true), true);
});

Deno.test(function lastIndexTest() {
  assertEquals(inc([1, 2, 3, 2], true), 2);
});


Deno.test(function firstIndexTest() {
  assertEquals(inc([7, 1, 2, 3, 2], true), 0);
});
