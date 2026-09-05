import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { ChecklistCategory, ChecklistItemSeed } from "../lib/checklistRules";

const TEMPLATE_STORAGE_KEY = "@checklist_template";

export interface ChecklistItem extends ChecklistItemSeed {
  done: boolean;
  assigneeId: string | null;
  custom: boolean;
}

interface Reminders {
  d7: boolean;
  d1: boolean;
}

const defaultReminders: Reminders = { d7: true, d1: true };

interface ChecklistState {
  itemsByTrip: Record<string, ChecklistItem[]>;
  remindersByTrip: Record<string, Reminders>;
  template: ChecklistItemSeed[] | null;
  hydrate(): Promise<void>;
  ensureGenerated(tripId: string, seeds: ChecklistItemSeed[]): void;
  toggleItem(tripId: string, itemId: string): void;
  addCustomItem(tripId: string, label: string, category: ChecklistCategory): void;
  removeItem(tripId: string, itemId: string): void;
  assignItem(tripId: string, itemId: string, assigneeId: string | null): void;
  toggleReminder(tripId: string, which: keyof Reminders): void;
  saveAsTemplate(tripId: string): Promise<void>;
  applyTemplate(tripId: string): void;
}

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  itemsByTrip: {},
  remindersByTrip: {},
  template: null,

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (raw) set({ template: JSON.parse(raw) as ChecklistItemSeed[] });
    } catch {
      // Storage unavailable — no template to restore.
    }
  },

  ensureGenerated(tripId, seeds) {
    if (get().itemsByTrip[tripId]) return;
    const items: ChecklistItem[] = seeds.map((seed) => ({ ...seed, done: false, assigneeId: null, custom: false }));
    set({
      itemsByTrip: { ...get().itemsByTrip, [tripId]: items },
      remindersByTrip: { ...get().remindersByTrip, [tripId]: get().remindersByTrip[tripId] ?? defaultReminders },
    });
  },

  toggleItem(tripId, itemId) {
    const current = get().itemsByTrip[tripId] ?? [];
    set({
      itemsByTrip: { ...get().itemsByTrip, [tripId]: current.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) },
    });
  },

  addCustomItem(tripId, label, category) {
    const current = get().itemsByTrip[tripId] ?? [];
    const item: ChecklistItem = { id: `custom_${Date.now()}`, label, category, done: false, assigneeId: null, custom: true };
    set({ itemsByTrip: { ...get().itemsByTrip, [tripId]: [...current, item] } });
  },

  removeItem(tripId, itemId) {
    const current = get().itemsByTrip[tripId] ?? [];
    set({ itemsByTrip: { ...get().itemsByTrip, [tripId]: current.filter((i) => i.id !== itemId) } });
  },

  assignItem(tripId, itemId, assigneeId) {
    const current = get().itemsByTrip[tripId] ?? [];
    set({ itemsByTrip: { ...get().itemsByTrip, [tripId]: current.map((i) => (i.id === itemId ? { ...i, assigneeId } : i)) } });
  },

  toggleReminder(tripId, which) {
    const current = get().remindersByTrip[tripId] ?? defaultReminders;
    set({ remindersByTrip: { ...get().remindersByTrip, [tripId]: { ...current, [which]: !current[which] } } });
  },

  async saveAsTemplate(tripId) {
    const items = get().itemsByTrip[tripId] ?? [];
    const template: ChecklistItemSeed[] = items.map(({ id, label, category }) => ({ id, label, category }));
    set({ template });
    try {
      await AsyncStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(template));
    } catch {
      // Best-effort, same as every other store in this app.
    }
  },

  applyTemplate(tripId) {
    const template = get().template;
    if (!template) return;
    const items: ChecklistItem[] = template.map((seed) => ({ ...seed, done: false, assigneeId: null, custom: false }));
    set({ itemsByTrip: { ...get().itemsByTrip, [tripId]: items } });
  },
}));
