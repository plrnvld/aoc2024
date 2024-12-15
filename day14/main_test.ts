import { assertEquals } from "@std/assert";
import { modulo } from "./main.ts";

Deno.test(function moduloTest() {
  assertEquals(modulo(57, 100), 57);
  assertEquals(modulo(144, 100), 44);
  assertEquals(modulo(352, 100), 52);
  assertEquals(modulo(-91, 100), 9);
  assertEquals(modulo(-288, 100), 12);
  assertEquals(modulo(-999, 100), 1);
  assertEquals(modulo(1774, 100), 74);
});
