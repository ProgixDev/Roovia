import type { ImageSourcePropType } from "react-native";
import { create } from "zustand";

import type { TripDay } from "../mocks/itineraries";
import { JOURNAL_PHOTOS } from "../mocks/journal";

export interface JournalEntry {
  dayIndex: number;
  caption: string;
  cover: ImageSourcePropType;
  photos: ImageSourcePropType[];
}

interface JournalState {
  recordingByTrip: Record<string, boolean>;
  batteryAwareByTrip: Record<string, boolean>;
  entriesByTrip: Record<string, JournalEntry[]>;
  toggleRecording(tripId: string): void;
  toggleBatteryAware(tripId: string): void;
  /** Builds one entry per day from the itinerary's own stops — a real track would build these from the recorded route instead. */
  ensureEntries(tripId: string, days: TripDay[]): void;
  updateCaption(tripId: string, dayIndex: number, caption: string): void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  recordingByTrip: {},
  batteryAwareByTrip: {},
  entriesByTrip: {},

  toggleRecording(tripId) {
    const current = get().recordingByTrip[tripId] ?? false;
    set({ recordingByTrip: { ...get().recordingByTrip, [tripId]: !current } });
  },

  toggleBatteryAware(tripId) {
    const current = get().batteryAwareByTrip[tripId] ?? true;
    set({ batteryAwareByTrip: { ...get().batteryAwareByTrip, [tripId]: !current } });
  },

  ensureEntries(tripId, days) {
    if (get().entriesByTrip[tripId]) return;
    const entries: JournalEntry[] = days.map((day, i) => ({
      dayIndex: day.index,
      caption: day.stops.length > 0 ? `Étape à ${day.stops[0].name}${day.stops.length > 1 ? ` et ${day.stops.length - 1} autre(s) arrêt(s)` : ""}.` : "",
      cover: JOURNAL_PHOTOS[i % JOURNAL_PHOTOS.length],
      photos: [JOURNAL_PHOTOS[i % JOURNAL_PHOTOS.length], JOURNAL_PHOTOS[(i + 1) % JOURNAL_PHOTOS.length]],
    }));
    set({ entriesByTrip: { ...get().entriesByTrip, [tripId]: entries } });
  },

  updateCaption(tripId, dayIndex, caption) {
    const current = get().entriesByTrip[tripId] ?? [];
    set({
      entriesByTrip: { ...get().entriesByTrip, [tripId]: current.map((e) => (e.dayIndex === dayIndex ? { ...e, caption } : e)) },
    });
  },
}));
