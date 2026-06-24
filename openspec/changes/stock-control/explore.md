# Exploration: stock-control

## Current State

- Repository appears to be a frontend-first Next.js app implementing a Clean Architecture split (README documents src/ domain/application/infrastructure/presentation). There is no obvious backend code or modules named `lib/stock` or `lib/product` in this repo.
- Inventory / stock is a documented domain concept (README: "Control de Stock", movements, alerts, RBAC), but I found no concrete implementation files (no `stock` or `inventory` directories at the repo root).
- Auth is handled by Better Auth (README references Better Auth and RBAC). HTTP client conventions: Axios with interceptors.

## Affected Areas (initial scan)
- README.md — authoritative project documentation referencing stock, movements, RBAC and env vars
- package.json — frontend project metadata (no server code discovered here)
- .env.example — contains NEXT_PUBLIC_MOCK_PRODUCTS and hints about API / mock configuration
- .git/config — indicates upstream repository name `inventory-manager` (repo name mismatch with package.json)
- tsconfig.tsbuildinfo — build artifact containing references but not source code

Note: many matches came from node_modules and build artifacts (kysely, next docs, pdfjs) — these are third-party references and not the project implementation.

## Key repositories/modules to consider
- frontend (this repo): presentation + application + infrastructure layers (Axios clients expected under infrastructure/api)
- backend (not present): expected REST/GraphQL endpoints for inventory reads and stock-adjusting movements
- product-management domain: products and catalog are tightly coupled to stock (product id, SKU, variants)
- auth/RBAC service: Better Auth is used for roles and protected routes

## Approaches for first slice
1. UI + API contract (fastest)
   - Implement a small UI in this repo that calls a new backend endpoint (GET /api/stock/:productId) and a POST /api/stock/movement for adjustments. Mock backend with NEXT_PUBLIC_MOCK_PRODUCTS for local dev.
   - Pros: low frontend churn, quick validation with mocks
   - Cons: requires backend endpoints (can be temporary mocked)

2. Domain library + backend (full)
   - Add a domain package (lib/stock) implementing the stock aggregate, movement log, validation rules and repository interface; implement backend endpoints that use it.
   - Pros: correct separation, testable domain, re-usable across services
   - Cons: higher initial effort

3. Event-driven / real-time (for high volume sites)
   - Use CDC/event stream so stock updates are pushed to listeners (WebSockets or server-sent events). Necessary if requirements include real-time inventory for many clients or high-frequency updates.
   - Pros: scalable for real-time UX
   - Cons: significantly more complexity (workers, event store, idempotency)

## Recommendation (first slice)

- Scope a small, well-scoped first slice: read + adjust via audited movements.
  - Contracts: GET /api/stock/:productId → { productId, stock, min, max } and POST /api/stock/movement → { productId, delta, reason, userId }
  - Persist movements as an append-only audit log (date, user, delta, reason, source).
  - Implement optimistic concurrency at the DB-level (version column) or use DB transactionally when applying adjustments.
  - Expose UI components (StockBadge, StockAdjustModal) and a simple use-case in application/use-cases that calls the API via infrastructure/api client.

## Technical constraints & testing needs
- Missing backend: this repo currently lacks concrete backend endpoints and an on-repo domain library for stock — we must either add backend code here or coordinate with backend repository.
- Auth/RBAC dependency: every stock-adjusting endpoint must validate user roles (Admin, Operator). Ensure Better Auth integration and token flow available in Axios interceptors.
- Concurrency & correctness: stock adjustments require transactional safety; design must avoid lost updates when concurrent movements occur.
- Data volume: for very large catalogs, queries must be paginated and aggregation (inventory value) done by background jobs or DB queries; consider materialized views for heavy reports.
- Real-time requirements: if the product needs live inventory updates in the storefront, plan a later phase for streaming or short cache lifetimes.
- Tests: unit tests for domain rules (stock cannot go negative unless allowed), integration tests for API endpoints, and E2E for the UI flows. Add property-based tests for concurrent delta application if possible.

## Open questions
1. Where does the canonical inventory data live today? (a separate backend repo or third-party ERP)
2. Is negative stock allowed? Are there business rules for backorders / reservations?
3. Expected scale: #products and expected update rate (writes/sec) for stock movements?
4. Do we need real-time updates for customer-facing pages on slice 1?
5. Which roles can perform adjustments and which must be audit-only (Admin vs Operator)?
6. Is there an existing backend repo we must integrate with, or should we add minimal endpoints to this monorepo?

## Ready for Proposal

- Yes — enough to write a focused SDD proposal for the first slice: "stock read + audited adjustments" with API contracts, UI components, and tests.

---

Generated by sdd-explore executor on project inventory-manager.
