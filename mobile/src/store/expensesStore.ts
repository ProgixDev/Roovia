import { create } from "zustand";

import type { Expense } from "../lib/settle";

export interface Participant {
  id: string;
  name: string;
}

interface ExpensesState {
  participantsByTrip: Record<string, Participant[]>;
  expensesByTrip: Record<string, Expense[]>;
  /** A demo toggle, not a real connectivity check — flips the "en attente" badge on new expenses and what "sync on reconnect" replays. */
  offline: boolean;
  ensureParticipants(tripId: string, defaultName: string): void;
  addParticipant(tripId: string, name: string): void;
  removeParticipant(tripId: string, participantId: string): void;
  addExpense(tripId: string, expense: Expense): void;
  removeExpense(tripId: string, expenseId: string): void;
  toggleOffline(): void;
  syncPending(tripId: string): void;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  participantsByTrip: {},
  expensesByTrip: {},
  offline: false,

  ensureParticipants(tripId, defaultName) {
    if (get().participantsByTrip[tripId]) return;
    set({
      participantsByTrip: { ...get().participantsByTrip, [tripId]: [{ id: "me", name: defaultName }] },
    });
  },

  addParticipant(tripId, name) {
    const current = get().participantsByTrip[tripId] ?? [];
    const participant: Participant = { id: `participant_${Date.now()}`, name };
    set({ participantsByTrip: { ...get().participantsByTrip, [tripId]: [...current, participant] } });
  },

  removeParticipant(tripId, participantId) {
    const current = get().participantsByTrip[tripId] ?? [];
    set({ participantsByTrip: { ...get().participantsByTrip, [tripId]: current.filter((p) => p.id !== participantId) } });
  },

  addExpense(tripId, expense) {
    const current = get().expensesByTrip[tripId] ?? [];
    set({ expensesByTrip: { ...get().expensesByTrip, [tripId]: [expense, ...current] } });
  },

  removeExpense(tripId, expenseId) {
    const current = get().expensesByTrip[tripId] ?? [];
    set({ expensesByTrip: { ...get().expensesByTrip, [tripId]: current.filter((e) => e.id !== expenseId) } });
  },

  toggleOffline() {
    set({ offline: !get().offline });
  },

  syncPending(tripId) {
    const current = get().expensesByTrip[tripId] ?? [];
    set({ expensesByTrip: { ...get().expensesByTrip, [tripId]: current.map((e) => ({ ...e, synced: true })) } });
  },
}));
