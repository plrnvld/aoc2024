import { assertEquals } from "@std/assert";
import { dec, diffLim, inc } from "./main.ts";

Deno.test(function incBasicTest() {
  assertEquals(inc([1, 2, 3], true), true);
});

Deno.test(function lastIndexTest() {
  assertEquals(inc([1, 2, 3, 2], true), 2);
});

Deno.test(function firstIndexTest() {
  assertEquals(inc([7, 1, 2, 3, 2], true), 0);
});
