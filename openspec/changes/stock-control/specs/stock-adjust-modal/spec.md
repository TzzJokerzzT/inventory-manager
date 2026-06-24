# Stock Adjust Modal (frontend component)

## Intent

- Provide a small modal used by Operators/Admins to propose adjustments to stock. The modal MUST validate inputs, preview resulting stock, and call POST /api/stock/movement.

## Actors / User stories

- Operator: As an operator, I WANT a quick form to record adjustments with reason so the movement log captures intent and user.

## Requirements

### Requirement: Adjustment form with validation and preview

The modal MUST include fields: delta (integer, positive or negative), reason (string, required), preview of resulting stock (computed client-side), and submit button. The modal SHALL block submission if resulting stock < 0 and show inline validation error.

#### Acceptance criteria

- GIVEN current stock=5
- WHEN user enters delta -7
- THEN preview shows resulting stock -2 and submit is disabled with message "Adjustment would produce negative stock"

- GIVEN valid delta and reason
- WHEN user submits
- THEN call POST /api/stock/movement and on 201 close modal and show success toast; on 400/409 show error and keep modal open

- GIVEN user without permission
- WHEN user opens modal
- THEN form SHALL be read-only or modal SHALL not open (see StockBadge behavior)

## API interaction

- Calls POST /api/stock/movement with { productId, delta, reason }
- On success: updates local product store/hook with returned stock and version

## Validation (Valibot example)

```ts
val.object({
  delta: val.number().int().neq(0),
  reason: val.string().min(5)
})
```

## Testability notes

- Unit: form validation rules, preview computation, button disabled states. vitest: npx vitest run src/components/StockAdjustModal.test.tsx
- Integration/E2E: storybook + Playwright flow to open modal, fill, submit, and assert movement recorded (mock server). Example: npx playwright test tests/e2e/stock-adjust.spec.ts

## Rollout notes

- Ensure modal actions are behind feature flag and that failures surface useful messages (don't expose raw stack traces). Add telemetry for adjustment attempts and failures.

## Non-goals

- The modal MUST NOT attempt to re-run complex reconciliation logic with external ERP — keep to user-entered delta and reason.

## Review Workload Forecast

- Estimated changed lines: 120 (modal component, hooks, tests, e2e story)
- Chained PR recommended: maybe — if repo requires new hooks/domain code; default: include with StockBadge PR
