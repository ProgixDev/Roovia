import { create } from "zustand";
import { queryClient } from "../lib/queryClient";
import { tokenStorage } from "../lib/tokenStorage";

/** Minimal shape — extend with whatever fields the app's own `/me` endpoint returns. */
export interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(user: AuthUser, accessToken: string, refreshToken: string): Promise<void>;
  logout(): Promise<void>;
  setAccessToken(token: string): void;
  /** Merges fresh profile fields into the cached user, e.g. after an edit. */
  setUser(patch: Partial<AuthUser>): void;
  /**
   * Fills in the profile `hydrate()` cannot: that call only has the token, so
   * `user` stays `null` across a restart until whoever still has a session
   * fetches the profile and hands the result here. Unlike `setUser`, this is
   * NOT a patch — it is the one place allowed to set `user` from `null`.
   */
  hydrateUser(user: AuthUser): void;
  hydrate(): Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  async login(user, accessToken, refreshToken) {
    await tokenStorage.saveTokens(accessToken, refreshToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  async logout() {
    await tokenStorage.clearTokens();
    set({ user: null, accessToken: null, isAuthenticated: false });

    // Every cached response was fetched AS the account being signed out, and
    // no query key records who fetched it. Left in place, the next account to
    // sign in within the cache's stale window is served the PREVIOUS
    // account's data straight from cache with no refetch.
    queryClient.clear();
  },

  setAccessToken(token) {
    set({ accessToken: token });
  },

  setUser(patch) {
    set((state) => (state.user ? { user: { ...state.user, ...patch } } : {}));
  },

  hydrateUser(user) {
    set({ user });
  },

  async hydrate() {
    try {
      const access = await tokenStorage.getAccessToken();
      if (access) {
        // Token exists — mark authenticated optimistically.
        // The 401 interceptor in lib/apiClient.ts handles expiry on first request.
        set({ accessToken: access, isAuthenticated: true });
      }
    } catch {
      // SecureStore unavailable (e.g. simulator without keychain) — treat as logged out
    } finally {
      set({ isLoading: false });
    }
  },
}));
