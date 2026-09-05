import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { UnitSystem } from "../lib/format";

const STORAGE_KEY = "@settings";

export type Currency = "EUR" | "USD" | "GBP" | "CHF";

interface PersistedShape {
  units: UnitSystem;
  currency: Currency;
}

interface SettingsState extends PersistedShape {
  hydrate(): Promise<void>;
  setUnits(units: UnitSystem): Promise<void>;
  setCurrency(currency: Currency): Promise<void>;
}

async function persist(state: PersistedShape): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort, same as every other store in this app.
  }
}

/**
 * Locale joins this store when todo.md's "International" section (§14)
 * needs it, rather than being pre-declared here unused.
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  units: "metric",
  currency: "EUR",

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<PersistedShape>;
      set({ units: saved.units ?? "metric", currency: saved.currency ?? "EUR" });
    } catch {
      // Storage unavailable — defaults stand.
    }
  },

  async setUnits(units) {
    set({ units });
    await persist({ units, currency: get().currency });
  },

  async setCurrency(currency) {
    set({ currency });
    await persist({ units: get().units, currency });
  },
}));
