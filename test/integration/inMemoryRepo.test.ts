import { expect, it } from "vitest";
import { InMemoryStockRepo } from "@/src/infra/stock/inMemoryRepo";

it("in-memory repo save and get", async () => {
  const repo = new InMemoryStockRepo();
  await repo.save({ productId: "p1", stock: 1, version: 1 });
  const r = await repo.get("p1");
  expect(r).not.toBeNull();
  expect(r?.stock).toBe(1);
});
