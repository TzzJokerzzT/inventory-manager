/**
 * Zustand auth store — single source of truth for auth state.
 *
 * This store manages user, session, role, loading, and error state.
 * It uses dependency injection to receive use cases, keeping the store
 * framework-agnostic and testable.
 *
 * The store does NOT import from React or Next.js directly.
 * Presentation concerns (providers, hooks) consume this store.
 */

import { create } from "zustand";
import {
  CheckPermissionUseCase,
  DuplicateEmailError,
  InvalidCredentialsError,
  InvalidEmailDomainError,
  LoginUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  RegisterUseCase,
  SessionExpiredError,
} from "../application/use-cases";
import type {
  LoginCredentials,
  RegistrationData,
  Role,
  Session,
  User,
} from "../domain/entities";
import type { IAuthRepository } from "../domain/repository";

// ---------------------------------------------------------------------------
// Store state shape
// ---------------------------------------------------------------------------

export interface AuthStoreState {
  /** Currently authenticated user, or null if logged out. */
  user: User | null;
  /** Current session, or null if not authenticated. */
  session: Session | null;
  /** User role derived from session.user.role, or null. */
  role: Role | null;
  /** True when user is authenticated (session + user exist). */
  isAuthenticated: boolean;
  /** True while auth operations are in progress. */
  isLoading: boolean;
  /** Error message string, or null if no error. */
  error: string | null;
}

export interface AuthStoreActions {
  /** Authenticate with email/password. */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Register a new account. Returns the created user (does not auto-login). */
  register: (data: RegistrationData) => Promise<User>;
  /** Invalidate the current session and clear all state. */
  logout: () => Promise<void>;
  /** Refresh the current session token. */
  refreshSession: () => Promise<void>;
  /** Check if the current user has the required role level. */
  checkPermission: (requiredRole: Role) => boolean;
  /** Clear the current error message. */
  clearError: () => void;
  /** Initialize session from an existing session (e.g., on mount). */
  setSession: (session: Session | null) => void;
  /** Reset all state to initial values. */
  reset: () => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

// ---------------------------------------------------------------------------
// Dependencies injected via factory
// ---------------------------------------------------------------------------

interface AuthStoreDeps {
  repository: IAuthRepository;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_STATE: AuthStoreState = {
  user: null,
  session: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Store factory
// ---------------------------------------------------------------------------

/**
 * Create a Zustand auth store with the given repository dependency.
 *
 * Use `createAuthStore(repository)` to get a fresh store instance.
 * This pattern enables testing with mock repositories.
 */
export function createAuthStore(deps: AuthStoreDeps) {
  const loginUseCase = new LoginUseCase(deps.repository);
  const registerUseCase = new RegisterUseCase(deps.repository);
  const logoutUseCase = new LogoutUseCase(deps.repository);
  const refreshSessionUseCase = new RefreshSessionUseCase(deps.repository);
  const checkPermissionUseCase = new CheckPermissionUseCase();

  return create<AuthStore>()((set, get) => ({
    // --- State ---
    ...INITIAL_STATE,

    // --- Actions ---

    login: async (credentials: LoginCredentials) => {
      set({ isLoading: true, error: null });
      try {
        const session = await loginUseCase.execute(credentials);
        set({
          user: session.user,
          session,
          role: session.user.role,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: unknown) {
        set({ isLoading: false });
        if (error instanceof InvalidCredentialsError) {
          set({ error: error.message });
        } else {
          set({ error: "Service unavailable, try again later" });
        }
        throw error;
      }
    },

    register: async (data: RegistrationData) => {
      set({ isLoading: true, error: null });
      try {
        const user = await registerUseCase.execute(data);
        // Registration doesn't auto-login; caller should redirect to /login
        set({ isLoading: false });
        return user;
      } catch (error: unknown) {
        set({ isLoading: false });
        if (error instanceof InvalidEmailDomainError) {
          set({ error: error.message });
        } else if (error instanceof DuplicateEmailError) {
          set({ error: error.message });
        } else {
          set({ error: "Service unavailable, try again later" });
        }
        throw error;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await logoutUseCase.execute();
      } finally {
        // Always clear client-side state, even if server call fails
        set({
          ...INITIAL_STATE,
          isLoading: false,
        });
      }
    },

    refreshSession: async () => {
      set({ isLoading: true, error: null });
      try {
        const session = await refreshSessionUseCase.execute();
        set({
          user: session.user,
          session,
          role: session.user.role,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: unknown) {
        set({ isLoading: false });
        if (error instanceof SessionExpiredError) {
          // Session expired — clear everything
          set({ ...INITIAL_STATE });
        } else {
          set({ error: "Failed to refresh session" });
        }
        throw error;
      }
    },

    checkPermission: (requiredRole: Role): boolean => {
      const { role } = get();
      if (!role) return false;
      return checkPermissionUseCase.execute(role, requiredRole);
    },

    clearError: () => set({ error: null }),

    setSession: (session: Session | null) => {
      if (session) {
        set({
          user: session.user,
          session,
          role: session.user.role,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set(INITIAL_STATE);
      }
    },

    reset: () => set(INITIAL_STATE),
  }));
}
