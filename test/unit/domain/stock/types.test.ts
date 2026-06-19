import { expect, it } from "vitest";
import type { StockRecord, Movement } from "@/src/domain/stock/types";

it("StockRecord shape", () => {
  const r: StockRecord = { productId: "p1", stock: 10, version: 1 };
  expect(r.productId).toBe("p1");
  expect(r.stock).toBe(10);
  expect(r.version).toBe(1);
});

it("Movement shape", () => {
  const m: Movement = {
    id: "m1",
    productId: "p1",
    delta: -2,
    reason: "correction",
    timestamp: new Date().toISOString(),
    version: 2,
  };
  expect(m.delta).toBe(-2);
  expect(m.productId).toBe("p1");
});
