/**
 * Auth application layer barrel exports.
 *
 * Exports use cases and domain error types.
 * This layer is framework-agnostic — no React or Next.js imports.
 */

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
} from "./use-cases";
