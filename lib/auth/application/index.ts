/**
 * Auth application layer barrel exports.
 *
 * Exports use cases and domain error types.
 * This layer is framework-agnostic — no React or Next.js imports.
 */

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
} from "./use-cases";
