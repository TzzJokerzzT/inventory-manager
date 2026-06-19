export type ProductId = string;

export type StockRecord = {
  productId: ProductId;
  stock: number;
  version: number;
  min?: number;
  max?: number;
};

export type Movement = {
  id: string;
  productId: ProductId;
  delta: number;
  reason: string;
  userId?: string;
  source?: string;
  timestamp: string;
  version: number;
};

export interface StockRepository {
  get(productId: ProductId): Promise<StockRecord | null>;
  save(record: StockRecord): Promise<void>;
  appendMovement(m: Movement): Promise<void>;
}
