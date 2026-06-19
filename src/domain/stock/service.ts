import { StockRecord, Movement } from "./types";

export function applyMovementToRecord(
  record: StockRecord,
  m: Movement,
): StockRecord {
  const newStock = record.stock + m.delta;
  if (newStock < 0) {
    throw new Error("resulting stock would be negative");
  }
  return {
    ...record,
    stock: newStock,
    version: record.version + 1,
  };
}

export async function applyMovement(
  repo: {
    get(productId: string): Promise<StockRecord | null>;
    save(r: StockRecord): Promise<void>;
    appendMovement(m: Movement): Promise<void>;
  },
  m: Movement,
) {
  const record = await repo.get(m.productId);
  if (!record) {
    // create new record starting at 0
    if (m.delta < 0) throw new Error("resulting stock would be negative");
    const r: StockRecord = {
      productId: m.productId,
      stock: m.delta,
      version: 1,
    };
    await repo.save(r);
    await repo.appendMovement(m);
    return r;
  }

  const updated = applyMovementToRecord(record, m);
  await repo.save(updated);
  await repo.appendMovement(m);
  return updated;
}
