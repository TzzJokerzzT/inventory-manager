/**
 * Auth presentation layer barrel exports.
 *
 * This is the public API of the auth presentation layer for
 * React components and hooks.
 */

// Provider and context
export { type AuthContextValue, AuthProvider, useAuth } from "./auth-provider";

// Store (for direct usage in non-React contexts or testing)
export {
  type AuthStore,
  type AuthStoreActions,
  type AuthStoreState,
  createAuthStore,
} from "./auth-store";

// Guards
export { type RoleGuardResult, useRoleGuard } from "./guards";
