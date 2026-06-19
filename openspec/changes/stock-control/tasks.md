# Tasks: stock-control

## Review Workload Forecast

Estimated changed lines: ~600
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units (PR slices)
PR-1 (base=feature/stock-control): Domain types, movement logic, migrations, in-memory repo (est 210 lines)
PR-2 (base=PR-1): API routes GET/POST, application use-cases, infra SQL repo wiring, auth checks, tests (est 220 lines)
PR-3 (base=PR-2): Client hooks, StockBadge, StockAdjustModal, stories/e2e tests, UI wiring (est 170 lines)

## Phase 1: Domain
 - [x] 1.1 | Domain: define StockRecord & Movement types + Repository interface | AC: types compiled, interfaces exported | Effort: small (4h) | est lines: 40 | deps: none | risk: low | tests: unit type/shape tests
 - [x] 1.2 | Domain: implement applyMovement (validate delta, enforce >=0, version inc) | AC: function returns new stock/version, rejects negative | Effort: medium (8h) | est lines: 80 | deps: 1.1 | risk: medium (concurrency) | tests: unit property tests

## Phase 2: Migration
 - [x] 2.1 | Migration: create stock_records & stock_movements SQL migrations + down scripts | AC: migrations run in test DB, schema matches spec | Effort: medium (8h) | est lines: 90 | deps: 1.1 | risk: medium (backfill time) | tests: migration schema test

## Phase 3: Infrastructure
 - [x] 3.1 | Repo infra: in-memory repo for dev & SQL repo stub implementing interface | AC: in-memory passes domain tests; SQL stub compiles | Effort: medium (8h) | est lines: 70 | deps: 1.1,2.1 | risk: medium | tests: integration in-memory
- [ ] 3.2 | Auth adapter: enforce roles (Admin/Operator/Viewer) in API infra | AC: endpoints reject/allow per role in integration tests | Effort: small (4h) | est lines: 30 | deps: infra auth hooks | risk: low | tests: integration RBAC tests

## Phase 4: Application
- [ ] 4.1 | Use-cases: GetStockUseCase (read) + ApplyMovementUseCase (transactional) | AC: use-cases call repo, handle version/conflict | Effort: medium (8h) | est lines: 70 | deps: 1.2,3.1 | risk: medium | tests: unit for use-cases

## Phase 5: Presentation / API
- [ ] 5.1 | API: GET /api/stock/:productId route + validation + feature-flag guard | AC: returns 200/404 per spec; behind feature flag | Effort: small (4h) | est lines: 60 | deps: 4.1 | risk: low | tests: integration GET test
- [ ] 5.2 | API: POST /api/stock/movement route + idempotency hint + 400/409 handling | AC: returns 201, 400, 409 per spec; persists movement | Effort: medium (10h) | est lines: 120 | deps: 4.1,3.1,3.2,2.1 | risk: high (concurrency) | tests: integration POST tests + property concurrency

## Phase 6: Presentation / Frontend
- [ ] 6.1 | Client hooks: useStock(productId) & useAdjustStock(productId) | AC: hooks call API, update local cache/version | Effort: small (4h) | est lines: 40 | deps: 5.1,5.2 | risk: low | tests: unit hook tests
- [ ] 6.2 | UI: StockBadge component (pill + keyboard + aria + click affordance) | AC: renders states ok/low/out; click opens modal when allowed | Effort: small (4h) | est lines: 40 | deps: 6.1 | risk: low | tests: unit + story
- [ ] 6.3 | UI: StockAdjustModal (form, preview, validation, submit) | AC: preview blocks negative, submits and closes on success | Effort: medium (10h) | est lines: 120 | deps: 6.1,6.2 | risk: medium | tests: unit + e2e flow

## Phase 7: Tests & Monitoring
- [ ] 7.1 | Unit tests: domain, use-cases, hooks, components | AC: coverage for critical rules (no-negative) | Effort: medium (8h) | est lines: 80 | deps: all | risk: low | tests: vitest suites
- [ ] 7.2 | Integration tests: API server with in-memory repo asserting GET/POST contracts | AC: integration suite passes in CI | Effort: medium (8h) | est lines: 80 | deps: 3.1,4.1,5.1,5.2 | risk: medium | tests: integration vitest
- [ ] 7.3 | E2E: Playwright story for adjust flow (open modal, submit, assert new stock) | AC: e2e passes in CI with mock server | Effort: medium (8h) | est lines: 60 | deps: 6.3,6.1,5.2 | risk: medium | tests: playwright

### Implementation order
Follow Clean Architecture: Domain (1.x) → Migrations (2.x) → Infra (3.x) → Application (4.x) → API (5.x) → Frontend (6.x) → Tests (7.x).

---
Files to create/update (examples):
- src/domain/stock/types.ts
- src/domain/stock/service.ts
- migrations/20260619_create_stock_tables.sql
- src/infra/stock/inMemoryRepo.ts
- src/infra/stock/sqlRepo.ts
- src/app/use-cases/getStock.ts
- src/app/use-cases/applyMovement.ts
- src/pages/api/stock/[productId].ts
- src/pages/api/stock/movement.ts
- src/hooks/useStock.ts
- src/components/StockBadge.tsx
- src/components/StockAdjustModal.tsx
- test/integration/stock-api.test.ts
