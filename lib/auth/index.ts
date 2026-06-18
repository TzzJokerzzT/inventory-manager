/**
 * Public barrel export for the auth module.
 *
 * This is the main entry point for application and presentation
 * layers to import auth types and utilities.
 *
 * Dependency flow: domain → (imported by) application → infrastructure → presentation
 * This barrel re-exports domain types and selected infrastructure utilities.
 */

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

// Application layer (framework-agnostic use cases)
export {
  AuthError,
  type AuthErrorCode,
  InvalidCredentialsError,
  InvalidEmailDomainError,
  DuplicateEmailError,
  SessionExpiredError,
  NetworkError,
  classifyError,
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  CheckPermissionUseCase,
} from "./application/use-cases";
