# Stock Badge (frontend component)

## Intent

- Display current stock inline on product pages and admin lists; provide affordance (click) to open StockAdjustModal for permitted users.

## Actors / User stories

- Shopper: As a shopper, I WANT to see available quantity as a small pill so I can choose variants or know availability.
- Operator: As an operator, I WANT to click the badge to open adjustment modal (if permitted) so I can quickly correct inventory.

## Requirements

### Requirement: Visual stock indicator and action affordance

The StockBadge component MUST display stock as a numeric pill and a status (low/ok/out). It SHOULD be keyboard-focusable and expose an aria-label for screen readers. Click/tap/Enter SHALL open StockAdjustModal only if user has adjust permission.

#### Acceptance criteria

- GIVEN product with stock > 0
- WHEN component renders
- THEN show stock number and status 'ok' or 'low' depending on min threshold

- GIVEN stock == 0
- WHEN component renders
- THEN show 'Out' or similar visual variant and status 'out'

- GIVEN user WITHOUT permission
- WHEN user clicks
- THEN StockAdjustModal MUST NOT open and component SHOULD show tooltip 'Insufficient permissions' when hovered (optional)

## API/props examples (React)

Props

- productId: string
- stock: number
- min?: number
- onOpenAdjust?: (productId) => void
- canAdjust: boolean

Example usage

<StockBadge productId="abc-123" stock={12} min={2} canAdjust={true} onOpenAdjust={() => openModal()} />

## Data/validation

- PropTypes/TS types: productId: string, stock: number>=0, min?: number>=0

## Testability notes

- Unit tests: render states (ok/low/out), keyboard interaction (Enter opens modal when canAdjust), aria-label presence. Example vitest: npx vitest run src/components/StockBadge.test.tsx
- Integration: storybook story + Chromatic visual tests for variants

## Rollout notes

- Feature-flag controlled render for interactive click behavior. For initial rollout, render badge as read-only for customers and interactive for internal users only.

## Non-goals

- Badge MUST NOT itself compute stock from remote; it is passed stock via props or hooks.

## Review Workload Forecast

- Estimated changed lines: 40 (component + tests + stories)
- Chained PR recommended: no
