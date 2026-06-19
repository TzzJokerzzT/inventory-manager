# Proposal: stock-control

## Intent
- Provide read and audited-adjust stock capabilities so product pages and ops can display and correct inventory reliably. First slice: safe reads, append-only movement audit, and a small UI to adjust stock with RBAC.

## Target users & scenarios
- Store operator: adjust stock after receiving/inspecting goods.
- Admin: audit movements, correct mistakes.
- Customer-facing read: show available quantity on product page.

## Business rules
- Stock is non-negative: negative stock is disallowed in MVP (no backorders). Adjustments that would produce <0 are rejected.
- Movements are append-only audit entries: {id, productId, delta, reason, userId, source, timestamp, version}.
- Concurrency: apply adjustments transactionally using optimistic version or DB transaction.

## RBAC requirements
- Roles: Admin (can read + adjust + view audit), Operator (can read + propose adjustments), Viewer (read-only). Integrate with existing Better Auth role checks in infrastructure/api.

## Success metrics
- 95% of stock reads return fresh data within 500ms.
- 0 data-loss incidents in first 30 days after rollout.
- Operators can record adjustments with <30s median time-to-complete.

## UX components (sketch)
- StockBadge: small inline pill showing current stock and status (low/ok/out). Click opens StockAdjustModal for permitted users.
- StockAdjustModal: form with fields {delta (+/-), reason (required), preview resulting stock, submit}. Show validation when result <0 and block.

## API contract (overview)
- GET /api/stock/:productId
  - Response: { productId, stock: number, min?: number, max?: number, version: number }
- POST /api/stock/movement
  - Request: { productId, delta: number, reason: string }
  - Response: { success: true, movement: { id, productId, delta, userId, timestamp, version } }

## Acceptance criteria (first slice)
- GET returns current stock for product pages.
- Operator can open StockAdjustModal and submit an adjustment; backend records movement and returns new version/stock.
- Attempts to reduce below zero are rejected with 400 and explanatory message.

## First slice (MVP) scope
- Minimal endpoints: GET /api/stock/:productId, POST /api/stock/movement.
- Frontend: StockBadge component, StockAdjustModal, integration in product page.
- Mock backend: local dev uses NEXT_PUBLIC_MOCK_PRODUCTS + mock handler for endpoints; CI uses simple in-memory repo tests.
- Tests: unit tests for validation (Valibot schemas), integration tests for API contracts, basic E2E for adjust flow.
- Non-goals: reservations/backorders, bulk import, real-time push updates, reporting dashboards.

## Rollout plan
1. Merge behind feature flag (NEXT_PUBLIC_FEATURE_STOCK_CONTROL=false).
2. Release to staging; run synthetic tests and smoke test UI flows.
3. Enable for 5% of traffic / internal users for 72h; monitor errors and latency.
4. Full rollout if metrics stable.

## Monitoring & alerts
- Track: POST error rate, GET latency, rate of rejected adjustments (<0). Alert if POST error rate >1% or GET P95 >1s.
- Audit sink: ship movements to logs/append store for retention 90 days.

## Migration & backward-compatibility
- If canonical inventory lives externally, adapters must reconcile on read; fallback to external source when version mismatch.
- Feature flag avoids user impact. API is additive; existing product reads unaffected.

## Risks
- Concurrent updates causing lost increments — mitigate with DB transactions/versioning.
- Unknown canonical data source — coordinate with backend/ERP owners.

## Open questions
1. Canonical inventory source (internal backend or external ERP)?
2. Are backorders/negative stock allowed later? (assumed no for MVP)
3. Expected product count and update rate?

## Proposal question round
- I recommend confirming Q1–Q3 above before sdd-spec.

---
Files created: openspec/changes/stock-control/proposal.md
