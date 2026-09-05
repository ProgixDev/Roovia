import { create } from "zustand";

import type { GeneratedItinerary, Stop, TripDay } from "../mocks/itineraries";

export interface ItineraryVersion {
  id: string;
  label: string;
  createdAt: number;
  days: TripDay[];
  totalDistanceKm: number;
  totalBudgetEur: number;
}

export interface Itinerary {
  tripId: string;
  destination: string;
  versions: ItineraryVersion[];
  activeVersionId: string;
  /** Stop ids that survive a refine/regenerate — checked by the mocked
   * generator before it swaps anything out. */
  lockedStopIds: string[];
}

interface ItineraryState {
  itineraries: Record<string, Itinerary>;
  createFromResult(tripId: string, result: GeneratedItinerary): void;
  addVersion(tripId: string, result: GeneratedItinerary, label: string): void;
  setActiveVersion(tripId: string, versionId: string): void;
  toggleLock(tripId: string, stopId: string): void;
  moveStop(tripId: string, dayId: string, stopId: string, direction: "up" | "down"): void;
  removeStop(tripId: string, dayId: string, stopId: string): void;
  addStop(tripId: string, dayId: string, stop: Stop): void;
}

function toVersion(result: GeneratedItinerary, label: string): ItineraryVersion {
  return {
    id: `version_${Date.now()}_${Math.round(Math.random() * 1000)}`,
    label,
    createdAt: Date.now(),
    days: result.days,
    totalDistanceKm: result.totalDistanceKm,
    totalBudgetEur: result.totalBudgetEur,
  };
}

/** Applies `fn` to the active version's days only — every manual-edit action shares this shape. */
function withActiveDays(
  itinerary: Itinerary,
  fn: (days: TripDay[]) => TripDay[],
): Itinerary {
  const versions = itinerary.versions.map((v) =>
    v.id === itinerary.activeVersionId ? { ...v, days: fn(v.days) } : v,
  );
  return { ...itinerary, versions };
}

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  itineraries: {},

  createFromResult(tripId, result) {
    const version = toVersion(result, "Version initiale");
    const itinerary: Itinerary = {
      tripId,
      destination: result.destination,
      versions: [version],
      activeVersionId: version.id,
      lockedStopIds: [],
    };
    set({ itineraries: { ...get().itineraries, [tripId]: itinerary } });
  },

  addVersion(tripId, result, label) {
    const current = get().itineraries[tripId];
    if (!current) return;
    const version = toVersion(result, label);
    const updated: Itinerary = {
      ...current,
      versions: [...current.versions, version],
      activeVersionId: version.id,
    };
    set({ itineraries: { ...get().itineraries, [tripId]: updated } });
  },

  setActiveVersion(tripId, versionId) {
    const current = get().itineraries[tripId];
    if (!current) return;
    set({ itineraries: { ...get().itineraries, [tripId]: { ...current, activeVersionId: versionId } } });
  },

  toggleLock(tripId, stopId) {
    const current = get().itineraries[tripId];
    if (!current) return;
    const lockedStopIds = current.lockedStopIds.includes(stopId)
      ? current.lockedStopIds.filter((id) => id !== stopId)
      : [...current.lockedStopIds, stopId];
    set({ itineraries: { ...get().itineraries, [tripId]: { ...current, lockedStopIds } } });
  },

  moveStop(tripId, dayId, stopId, direction) {
    const current = get().itineraries[tripId];
    if (!current) return;
    const updated = withActiveDays(current, (days) =>
      days.map((day) => {
        if (day.id !== dayId) return day;
        const index = day.stops.findIndex((s) => s.id === stopId);
        const swapWith = direction === "up" ? index - 1 : index + 1;
        if (index === -1 || swapWith < 0 || swapWith >= day.stops.length) return day;
        const stops = [...day.stops];
        [stops[index], stops[swapWith]] = [stops[swapWith], stops[index]];
        return { ...day, stops };
      }),
    );
    set({ itineraries: { ...get().itineraries, [tripId]: updated } });
  },

  removeStop(tripId, dayId, stopId) {
    const current = get().itineraries[tripId];
    if (!current) return;
    const updated = withActiveDays(current, (days) =>
      days.map((day) => (day.id === dayId ? { ...day, stops: day.stops.filter((s) => s.id !== stopId) } : day)),
    );
    set({
      itineraries: { ...get().itineraries, [tripId]: updated },
    });
  },

  addStop(tripId, dayId, stop) {
    const current = get().itineraries[tripId];
    if (!current) return;
    const updated = withActiveDays(current, (days) =>
      days.map((day) => (day.id === dayId ? { ...day, stops: [...day.stops, stop] } : day)),
    );
    set({ itineraries: { ...get().itineraries, [tripId]: updated } });
  },
}));
