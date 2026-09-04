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
  /**
   * Clears the seen flag so onboarding shows again on the next cold start,
   * and lets a caller navigate straight to `/onboarding` to preview it
   * immediately without restarting the app. A dev/preview affordance — see
   * its wiring in `app/(tabs)/_layout.tsx` — not something an end user's
   * flow calls.
   */
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
      await AsyncStorage.removeItem(ONBOARDING_SEEN_KEY);
    } catch {
      // Best-effort, same as `markSeen` — the in-memory flag above is
      // already correct for this session even if the write fails.
    }
  },
}));
