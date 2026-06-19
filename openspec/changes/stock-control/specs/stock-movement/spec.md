# Stock Movement (POST /api/stock/movement)

## Intent

- Provide an append-only audited movement API that records deltas against product stock and returns the new stock and version. Movements MUST be validated, idempotent (when possible), and reject attempts that would make stock < 0.

## Actors / User stories

- Operator: As an operator, I WANT to record received or removed units so the inventory is accurate and auditable.
- Admin: As an admin, I WANT movements to be stored immutably for audit and debugging.

## Requirements

### Requirement: Append-only movement log and apply delta

The system MUST create an immutable movement record for every successful adjustment and atomically apply the delta to the product's stock. Movements SHALL contain {id, productId, delta, reason, userId, source, timestamp, version}.

#### Acceptance criteria (GIVEN / WHEN / THEN)

- GIVEN authenticated user with role Operator or Admin
- WHEN POST /api/stock/movement with { productId, delta, reason }
- THEN validate request, apply delta transactionally, persist movement, return 201 with movement and resulting stock/version

- GIVEN adjustment would make stock < 0
- WHEN POST called
- THEN respond 400 with error { code: 'stock_negative', message }

#### Edge cases

- GIVEN concurrent adjustments
- WHEN two POSTs apply near-simultaneously
- THEN the system MUST prevent lost updates using optimistic version or DB transaction; one request MUST succeed and the other MUST retry or fail with 409 conflict and suggested retry

## API examples

Request

POST /api/stock/movement
Content-Type: application/json

{
  "productId": "abc-123",
  "delta": -3,
  "reason": "Received damaged; discard"
}

Response 201

{
  "success": true,
  "movement": {
    "id": "mov_001",
    "productId": "abc-123",
    "delta": -3,
    "reason": "Received damaged; discard",
    "userId": "user-7",
    "source": "web:stock-adjust-modal",
    "timestamp": "2026-06-19T12:34:56.789Z",
    "version": 43
  },
  "stock": 9
}

Response 400 (would go negative)

{
  "error": "stock_negative",
  "message": "Adjustment would produce negative stock (current=2, delta=-3)"
}

Response 409 (conflict)

{
  "error": "conflict",
  "message": "Concurrent modification. Please retry",
  "currentVersion": 44
}

## Data model summary

- Movement
  - id: string (PK, uuid)
  - productId: string (FK)
  - delta: integer (can be negative or positive, non-zero)
  - reason: string (non-empty)
  - userId: string
  - source: string OPTIONAL
  - timestamp: ISO8601
  - version: integer — the resulting stock version after applying this movement

Valibot validation (example)

```ts
val.object({
  productId: val.string().nonempty(),
  delta: val.number().int().neq(0),
  reason: val.string().nonempty()
})
```

## Testability notes

- Unit: valibot schema tests, movement creation logic, and business rule (no negative stock). Example vitest: npx vitest run src/domain/stock/movement.test.ts
- Integration: in-memory repo + API server tests asserting 201/400/409 responses. Example: npx vitest run test/integration/stock-movement.test.ts
- Property/concurrency tests: property-based test to apply random deltas concurrently and assert stock >= 0 and movement log consistency.

## Rollout & migration notes

- Persist movements to a new table `stock_movements` if not present. Migration MUST backfill existing stock records into an initial movement for historical continuity.
- Retention: keep movements for 90 days in primary DB, with archive to cold storage thereafter.

## Non-goals

- This API MUST NOT perform bulk import of movements; bulk import is out-of-scope for MVP.

## Review Workload Forecast

- Estimated changed lines: 180 (API route, domain logic, validation, tests, migration)
- Chained PR recommended: yes if repo adds domain + infra; recommend split: PR-1 domain & migrations, PR-2 API route + infra wiring + tests, PR-3 client integration
