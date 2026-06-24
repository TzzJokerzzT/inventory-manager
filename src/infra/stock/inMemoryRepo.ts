import { StockRecord, Movement, StockRepository } from "@/src/domain/stock";

export class InMemoryStockRepo implements StockRepository {
  private records = new Map<string, StockRecord>();
  private movements: Movement[] = [];

  async get(productId: string) {
    return this.records.get(productId) ?? null;
  }

  async save(r: StockRecord) {
    this.records.set(r.productId, r);
  }

  async appendMovement(m: Movement) {
    this.movements.push(m);
  }

  // test helpers
  _dumpRecords() {
    return Array.from(this.records.values());
  }

  _dumpMovements() {
    return this.movements.slice();
  }
}
