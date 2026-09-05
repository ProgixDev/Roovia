import { create } from "zustand";

import { generateSuggestions, type Suggestion } from "../mocks/suggestions";
import type { TripDay } from "../mocks/itineraries";

interface SuggestionsState {
  byTrip: Record<string, Suggestion[]>;
  dismissedIds: Record<string, string[]>;
  appliedIds: Record<string, string[]>;
  /** The most recently applied suggestion per trip — "annuler le recalcul" un-marks this one specifically, not just any applied suggestion. */
  lastApplied: Record<string, string | null>;
  /** Generates once per trip and caches — re-computing on every render would hand out new suggestion ids each time. */
  ensureGenerated(tripId: string, days: TripDay[]): void;
  /** A manual "recalculer depuis ici" — injects one ad-hoc suggestion instead of generating a whole new batch. */
  addManual(tripId: string, suggestion: Suggestion): void;
  dismiss(tripId: string, suggestionId: string): void;
  markApplied(tripId: string, suggestionId: string): void;
  undoLastApplied(tripId: string): string | null;
}

export const useSuggestionsStore = create<SuggestionsState>((set, get) => ({
  byTrip: {},
  dismissedIds: {},
  appliedIds: {},
  lastApplied: {},

  ensureGenerated(tripId, days) {
    if (get().byTrip[tripId]) return;
    set({ byTrip: { ...get().byTrip, [tripId]: generateSuggestions(days) } });
  },

  addManual(tripId, suggestion) {
    const current = get().byTrip[tripId] ?? [];
    set({ byTrip: { ...get().byTrip, [tripId]: [suggestion, ...current] } });
  },

  dismiss(tripId, suggestionId) {
    const current = get().dismissedIds[tripId] ?? [];
    set({ dismissedIds: { ...get().dismissedIds, [tripId]: [...current, suggestionId] } });
  },

  markApplied(tripId, suggestionId) {
    const current = get().appliedIds[tripId] ?? [];
    set({
      appliedIds: { ...get().appliedIds, [tripId]: [...current, suggestionId] },
      lastApplied: { ...get().lastApplied, [tripId]: suggestionId },
    });
  },

  undoLastApplied(tripId) {
    const suggestionId = get().lastApplied[tripId];
    if (!suggestionId) return null;
    const current = get().appliedIds[tripId] ?? [];
    set({
      appliedIds: { ...get().appliedIds, [tripId]: current.filter((id) => id !== suggestionId) },
      lastApplied: { ...get().lastApplied, [tripId]: null },
    });
    return suggestionId;
  },
}));
