# Stock Migration (movement log / DB migration)

## Intent

- Create database schema for append-only movement log and optionally backfill initial movement(s) to enable audit and versioning.

## Actors / User stories

- DBA/Backend Engineer: As an engineer, I WANT a migration that creates `stock_movements` and `stock_records` tables so the application can persist movements and compute stock.

## Requirements

### Requirement: Movement and stock tables

The system MUST introduce tables required to store movements and current stock. Migrations SHALL be reversible (down migrations) for staged rollouts.

Schema (example, SQL)

- stock_records
  - product_id TEXT PRIMARY KEY
  - stock INTEGER NOT NULL DEFAULT 0
  - min INTEGER
  - max INTEGER
  - version INTEGER NOT NULL DEFAULT 0

- stock_movements
  - id TEXT PRIMARY KEY
  - product_id TEXT NOT NULL REFERENCES stock_records(product_id)
  - delta INTEGER NOT NULL
  - reason TEXT NOT NULL
  - user_id TEXT
  - source TEXT
  - timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
  - version INTEGER NOT NULL -- resulting version after applying

#### Acceptance criteria

- GIVEN migration applied
- WHEN inspection performed
- THEN both tables exist and a test movement can be inserted and stock_record updated atomically

## Migration/backfill notes

- If existing `products` table contains a `stock` column, migration SHOULD create an initial movement per product capturing that value as version 1 and leave stock_records.stock in sync.
- For large catalogs consider background backfill job (batch) to avoid long migration windows; mark backfill progress in a table `stock_backfill_progress`.

## Testability notes

- Run migration in test DB and assert schema. Example vitest migration test: npx vitest run test/migrations/stock-migration.test.ts

## Rollout

- Apply migrations behind migration tooling; do not enable write path until backfill completes or feature flag allows fallback to external source.

## Non-goals

- This migration does NOT import historical movement data from external systems — that is out-of-scope for MVP.

## Review Workload Forecast

- Estimated changed lines: 90 (migration SQL + backfill helper + tests)
- Chained PR recommended: yes — recommend PR-1 migration + domain types, PR-2 backfill job + tests
