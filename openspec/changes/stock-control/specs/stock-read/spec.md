# Stock Read (GET /api/stock/:productId)

## Intent

- Provide a read API that returns the canonical available stock for a product with a version token for optimistic concurrency. This endpoint MUST be safe for customer-facing pages and low-latency reads.

## Actors / User stories

- Customer-facing UI: As a shopper, I WANT to see available quantity on product pages so I can decide to buy.
- Operator/Admin: As an operator, I WANT to view current stock and version so I can reconcile and audit adjustments.

## Requirements

### Requirement: Provide current stock with version

The system MUST return the current available stock for a product and a version number (integer) that increments with each movement. Reads SHALL be served from the canonical store or a read-replica that guarantees eventual consistency within acceptable latency.

#### Acceptance criteria (GIVEN / WHEN / THEN)

- GIVEN a product with an existing stock record
- WHEN a client calls GET /api/stock/:productId
- THEN respond 200 with JSON: { productId, stock: number, min?: number, max?: number, version: number }

#### Edge cases

- GIVEN unknown productId
- WHEN GET called
- THEN respond 404 with { error: 'product_not_found' }

- GIVEN product exists but no stock record
- WHEN GET called
- THEN respond 200 with stock: 0 and version: 0

## API examples

Request

GET /api/stock/abc-123

Response 200

{
  "productId": "abc-123",
  "stock": 12,
  "min": 2,
  "max": 100,
  "version": 42
}

Response 404 (not found)

{
  "error": "product_not_found",
  "message": "Product abc-999 not found"
}

## Data model summary

- StockRecord
  - productId: string (PK)
  - stock: integer (>= 0)
  - min: integer (>= 0) OPTIONAL
  - max: integer (>= min) OPTIONAL
  - version: integer (>= 0) — increments with each movement

Valibot validation (example)

```ts
val.object({
  productId: val.string().nonempty(),
  stock: val.number().int().gte(0),
  min: val.number().int().gte(0).optional(),
  max: val.number().int().gte(0).optional(),
  version: val.number().int().gte(0)
})
```

## Testability notes

- Unit tests: serializer/mapper and controller logic should be covered. Example vitest command: npx vitest run src/routes/stock-read.test.ts
- Integration acceptance: spin up API app (with in-memory repo) and assert GET contract. Example: npx vitest run test/integration/stock-api.test.ts::GET_stock_returns_record
- Performance: synthetic test to assert 95% of requests <500ms — script: scripts/loadtest/get-stock.js

## Rollout & migration notes

- API is additive. Route MUST be protected by feature flag NEXT_PUBLIC_FEATURE_STOCK_CONTROL until rollout.
- If canonical inventory lives externally, implement adapter logic: on version mismatch, surface source mismatch and optionally fallback to external read (later phase).

## Non-goals

- This endpoint MUST NOT reserve inventory or create holds. It is read-only and MUST NOT change state.

## Review Workload Forecast

- Estimated changed lines: 60
- Chained PR recommended: no (small, single-file API + client hook)
- Suggested PR split: 1) API route + tests, 2) client hook + unit tests
