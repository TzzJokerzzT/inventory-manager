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
// Repository interface
export type { IAuthRepository } from "./repository";
export type { LoginInput, RegisterInput } from "./schemas";

// Schemas
export {
  LoginSchema,
  RegisterSchema,
  validateLogin,
  validateRegister,
} from "./schemas";
export type { AllowedEmailDomain } from "./value-objects";
// Value objects
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
} from "./value-objects";
