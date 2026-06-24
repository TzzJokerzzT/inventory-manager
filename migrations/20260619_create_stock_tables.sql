-- Up: create stock_records and stock_movements
CREATE TABLE IF NOT EXISTS stock_records (
  product_id TEXT PRIMARY KEY,
  stock INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  min INTEGER,
  max INTEGER
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES stock_records(product_id),
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  user_id TEXT,
  source TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  version INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
