/**
 * Public barrel export for the auth module.
 *
 * This is the main entry point for application and presentation
 * layers to import auth types and utilities.
 *
 * Dependency flow: domain → (imported by) application → infrastructure → presentation
 * This barrel re-exports domain types and selected infrastructure utilities.
 */

// Application layer (framework-agnostic use cases)
export {
  AuthError,
  type AuthErrorCode,
  CheckPermissionUseCase,
  classifyError,
  DuplicateEmailError,
  InvalidCredentialsError,
  InvalidEmailDomainError,
  LoginUseCase,
  LogoutUseCase,
  NetworkError,
  RefreshSessionUseCase,
  RegisterUseCase,
  SessionExpiredError,
} from "./application/use-cases";
// Domain layer (framework-agnostic)
export type {
  AuthState,
  LoginCredentials,
  RegistrationData,
  Role,
  Session,
  SessionStatus,
  User,
} from "./domain/entities";
export type { IAuthRepository } from "./domain/repository";
export type { LoginInput, RegisterInput } from "./domain/schemas";
export {
  LoginSchema,
  RegisterSchema,
  validateLogin,
  validateRegister,
} from "./domain/schemas";
export type { AllowedEmailDomain } from "./domain/value-objects";
export {
  ALLOWED_EMAIL_DOMAINS,
  DEFAULT_ROLE,
  extractEmailDomain,
  hasPermission,
  isAllowedEmailDomain,
  isValidRole,
  ROLE_HIERARCHY,
  SESSION_TIMEOUTS,
  VALID_ROLES,
} from "./domain/value-objects";
export {
  type AuthContextValue,
  AuthProvider,
  useAuth,
} from "./presentation/auth-provider";
// Presentation layer (React components, hooks, store)
export {
  type AuthStore,
  type AuthStoreActions,
  type AuthStoreState,
  createAuthStore,
} from "./presentation/auth-store";
export { type RoleGuardResult, useRoleGuard } from "./presentation/guards";
export { AuthWrapper } from "./presentation/auth-wrapper";
