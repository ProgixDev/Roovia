import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

// App-agnostic key, matching ThemeContext's `@theme_mode` naming — this file
// ships as part of the template itself, and a project-specific prefix here
// is exactly the kind of thing scripts/rename-project.ts does NOT touch, so
// it would otherwise survive into every app renamed from this template.
const ONBOARDING_SEEN_KEY = "@onboarding_seen";

interface OnboardingState {
  /**
   * `null` until `hydrate()` resolves — the splash screen's routing decision
   * (onboarding vs. straight to the app) has to wait for a real answer
   * rather than defaulting either way, or a fresh install would flash the
   * wrong screen for one frame.
   */
  hasSeenOnboarding: boolean | null;
  hydrate(): Promise<void>;
  /** Marks onboarding as seen — call on "Skip" or the final slide's CTA alike. */
  markSeen(): Promise<void>;
  /** Flips the flag back to unseen — a debug/support control (Profile tab),
   * not a user-facing onboarding step. `app/index.tsx`'s routing already
   * checks `hasSeenOnboarding` before `isAuthenticated`, so this alone is
   * enough to make the next logout (or cold start) land on `/onboarding`
   * instead of the login screen. */
  reset(): Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasSeenOnboarding: null,

  async hydrate() {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
      set({ hasSeenOnboarding: value === "true" });
    } catch {
      // Storage unavailable — treat as not-yet-seen rather than getting
      // stuck on `null` forever; worst case a returning user sees the intro
      // slides again, which is recoverable, unlike a splash that never routes.
      set({ hasSeenOnboarding: false });
    }
  },

  async markSeen() {
    set({ hasSeenOnboarding: true });
    try {
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    } catch {
      // Best-effort persistence — the in-memory flag above already lets the
      // user through for this session even if the write fails.
    }
  },

  async reset() {
    set({ hasSeenOnboarding: false });
    try {
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "false");
    } catch {
      // Best-effort, same as markSeen — in-memory flag already flipped.
    }
  },
}));
