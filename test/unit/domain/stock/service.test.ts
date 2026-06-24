import { expect, it } from "vitest";
import { applyMovementToRecord } from "@/src/domain/stock/service";

it("apply positive movement", () => {
  const r = { productId: "p1", stock: 5, version: 1 };
  const out = applyMovementToRecord(r, {
    id: "m1",
    productId: "p1",
    delta: 3,
    reason: "restock",
    timestamp: new Date().toISOString(),
    version: 1,
  });
  expect(out.stock).toBe(8);
  expect(out.version).toBe(2);
});

it("reject negative resulting stock", () => {
  const r = { productId: "p1", stock: 2, version: 4 };
  expect(() =>
    applyMovementToRecord(r, {
      id: "m2",
      productId: "p1",
      delta: -5,
      reason: "shrink",
      timestamp: new Date().toISOString(),
      version: 4,
    }),
  ).toThrow();
});
