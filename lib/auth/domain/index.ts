/**
 * Public API for the auth domain layer.
 *
 * This barrel file re-exports everything from domain submodules.
 * Application and infrastructure layers import from here.
 */

// Entities
export type {
  AuthState,
  LoginCredentials,
  RegistrationData,
  Role,
  Session,
  SessionStatus,
  User,
} from "./entities";

// Value objects
export {
  ALLOWED_EMAIL_DOMAINS,
  DEFAULT_ROLE,
  ROLE_HIERARCHY,
  SESSION_TIMEOUTS,
  VALID_ROLES,
  extractEmailDomain,
  hasPermission,
  isAllowedEmailDomain,
  isValidRole,
} from "./value-objects";

export type { AllowedEmailDomain } from "./value-objects";

// Schemas
export {
  LoginSchema,
  RegisterSchema,
  validateLogin,
  validateRegister,
} from "./schemas";

export type { LoginInput, RegisterInput } from "./schemas";

// Repository interface
export type { IAuthRepository } from "./repository";
