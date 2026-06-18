# Tasks: Auth Foundation — Authentication & RBAC

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1500–1800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (tasks 1-3) → PR 2 (tasks 4-5) → PR 3 (tasks 6-8) → PR 4 (tasks 9-10) |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Base |
|------|------|-----------|------|
| 1 | Foundation + Infrastructure (domain, testing, HTTP client, Better Auth adapter) | PR 1 | main |
| 2 | Application + State + Protection (use cases, provider, hooks, proxy, guards, error pages) | PR 2 | main |
| 3 | UI Pages + Navigation (login, register, sidebar, navbar) | PR 3 | main |
| 4 | Session + Integration (expiry modal, dashboard, env config, e2e tests) | PR 4 | main |

## Phase 1: Foundation & Infrastructure

- [x] **1.1 Vitest + testing setup** — Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `happy-dom`. Create `vitest.config.ts` with happy-dom, path alias (`@/`). Add test script to `package.json`. Verify: `bun vitest run` passes on a trivial test.

- [x] **1.2 Domain layer** — `lib/auth/domain/` with `User`, `Session` entities; `Role` type (`admin|operador|solo_lectura`); `ROLE_HIERARCHY` mapping; `AuthRepository` interface; Valibot `LoginSchema`/`RegisterSchema` with domain whitelist; `lib/constants.ts` (domains, roles, timeouts); `lib/icons.tsx` (Lucide re-exports). Tests for validation schemas and role hierarchy.

- [x] **1.3 Infrastructure layer** — `lib/http-client.ts` (Axios instance + response interceptor with refresh lock, 401→refresh→retry, refresh failure→expiry trigger); `lib/auth/infrastructure/auth-client.ts` (Better Auth `createAuthClient` with custom session plugin for role); `lib/auth/infrastructure/cookie-service.ts` (read `better-auth.session_token`). Tests for interceptor behavior and cookie parsing.

## Phase 2: Application & State Management

- [x] **2.1 Application use cases** — `lib/auth/application/use-cases.ts` implementing `AuthRepository`: `LoginUseCase` (call backend, return session), `RegisterUseCase`, `LogoutUseCase` (clear state + backend), `GetSessionUseCase` (fetch from `/api/auth/session`), `CheckPermissionUseCase` (compare role against requirement). `lib/auth/index.ts` barrel exports. Unit tests for each use case.

- [x] **2.2 Auth provider + hooks + guards** — `lib/auth/presentation/auth-provider.tsx` (Zustand `useAuthStore` with user/role/isLoading/isAuthenticated; TanStack Query for `["auth","session"]`; context bridge), `use-auth.ts` (typed hook), `use-role-guard.ts` (compare role vs required, redirect to `/forbidden`), `role-guard.tsx` (wrapper component). Tests for provider initialization, role guard logic.

## Phase 3: Route Protection & Pages

- [x] **3.1 Route protection** — `proxy.ts` (Next.js 16: cookie existence check, redirect unauthenticated from `/protected/*` to `/login`, redirect authenticated from `/login` to `/protected/dashboard`); `app/(protected)/layout.tsx` (Client, full session validation via `GetSessionUseCase`, role-based route check, renders Sidebar/Navbar/SessionExpiryModal); `app/unauthorized.tsx` (static 401 page); `app/forbidden.tsx` (static 403 page). Update `app/layout.tsx` to wrap with `AuthProvider` + `QueryClientProvider`.

- [x] **3.2 Login page** — `app/(auth)/login/page.tsx` (HeroUI `Card` + `TextField` + `FieldError` + `Form` + `Button`; Valibot `LoginSchema`; inline field errors; generic error on invalid credentials; on success redirect to `/protected/dashboard`; already-authenticated redirect to dashboard). Client component.

- [x] **3.3 Register page** — `app/(auth)/register/page.tsx` (HeroUI form with email/password/name; Valibot `RegisterSchema` with `emailDomain` pipe; domain whitelist error; existing-email error; on success redirect to `/login` with message). Client component.

## Phase 4: Navigation, Session & Integration

- [x] **4.1 Sidebar + Navbar** — `app/(protected)/_components/sidebar.tsx` (role-conditional nav items: admin→all, operador→dashboard+inventory, solo_lectura→dashboard only; Lucide icons; `AnimatePresence` + `motion.div` for open/close; responsive `Drawer` for mobile); `navbar.tsx` (user name display, role badge, logout button via `useAuth`). Client components.

- [x] **4.2 Session management** — `app/(protected)/_components/session-expiry-modal.tsx` (inactivity timer tracking mouse/key/scroll/touch; 30-min default timeout; 7-day absolute session limit; non-dismissable HeroUI `Modal` with countdown; `isDismissable={false}`, no Escape close; "Go to Login" button clears state + redirects to `/login`). Wire to `useAuthStore`.

- [x] **4.3 Dashboard + integration** — `app/(protected)/dashboard/page.tsx` (generic post-login landing, role-aware greeting, basic stats cards fetched from backend); `.env.example` with `NEXT_PUBLIC_API_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`; final wiring: AuthProvider in root layout, verify all routes, full integration test for login→dashboard→logout flow. Update `package.json` scripts.
