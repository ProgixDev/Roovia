import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { UnitSystem } from "../lib/format";

const STORAGE_KEY = "@settings";

interface SettingsState {
  units: UnitSystem;
  hydrate(): Promise<void>;
  setUnits(units: UnitSystem): Promise<void>;
}

/**
 * Starts minimal — just the unit system §2's dimension fields need right
 * now. Locale and currency join this same store when todo.md's
 * "International" section (§14) and "Budget" (§7) need them, rather than
 * being pre-declared here unused.
 */
export const useSettingsStore = create<SettingsState>((set) => ({
  units: "metric",

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<{ units: UnitSystem }>;
      if (saved.units) set({ units: saved.units });
    } catch {
      // Storage unavailable — default stands.
    }
  },

  async setUnits(units) {
    set({ units });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ units }));
    } catch {
      // Best-effort, same as every other store in this app.
    }
  },
}));
