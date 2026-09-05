import { create } from "zustand";

import { buildMockItinerary, type GeneratedItinerary, type Stop, type TripDay } from "../mocks/itineraries";
import type { Suggestion } from "../mocks/suggestions";
import { SEED_TRIPS } from "./tripsStore";

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
  favoriteStopIds: string[];
}

interface ItineraryState {
  itineraries: Record<string, Itinerary>;
  createFromResult(tripId: string, result: GeneratedItinerary): void;
  addVersion(tripId: string, result: GeneratedItinerary, label: string): void;
  setActiveVersion(tripId: string, versionId: string): void;
  toggleLock(tripId: string, stopId: string): void;
  toggleFavorite(tripId: string, stopId: string): void;
  moveStop(tripId: string, dayId: string, stopId: string, direction: "up" | "down"): void;
  removeStop(tripId: string, dayId: string, stopId: string): void;
  addStop(tripId: string, dayId: string, stop: Stop): void;
  /** Accepting a re-route suggestion (§5) — a new version, same as refine, so "undo" is just a pointer move. */
  applySuggestion(tripId: string, suggestion: Suggestion): void;
  /** Steps `activeVersionId` back one version — the "annuler le recalcul" affordance. */
  undoLastVersion(tripId: string): void;
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

/**
 * Every non-draft seed trip gets a fabricated itinerary up front — see
 * `buildMockItinerary`'s doc — so opening one of Home's pre-existing trips
 * (none of which ever went through `/generate`) shows a real day-by-day
 * plan instead of the "not generated yet" empty state. Drafts keep that
 * empty state on purpose: it's the one place the app still shows what a
 * trip looks like before the AI has run.
 */
function seedItineraries(): Record<string, Itinerary> {
  const result: Record<string, Itinerary> = {};
  for (const trip of SEED_TRIPS) {
    if (trip.status === "draft" || trip.distanceKm === null || trip.budgetEur === null) continue;
    const dayCount = trip.dayProgress?.total ?? Math.max(3, Math.min(7, Math.round(trip.distanceKm / 150)));
    const result_ = buildMockItinerary({
      title: trip.title,
      destination: trip.destination,
      totalDistanceKm: trip.distanceKm,
      totalBudgetEur: trip.budgetEur,
      dayCount,
    });
    const version = toVersion(result_, "Généré par l'IA");
    result[trip.id] = {
      tripId: trip.id,
      destination: result_.destination,
      versions: [version],
      activeVersionId: version.id,
      lockedStopIds: [],
      favoriteStopIds: [],
    };
  }
  return result;
}

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  itineraries: seedItineraries(),

  createFromResult(tripId, result) {
    const version = toVersion(result, "Version initiale");
    const itinerary: Itinerary = {
      tripId,
      destination: result.destination,
      versions: [version],
      activeVersionId: version.id,
      lockedStopIds: [],
      favoriteStopIds: [],
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

  toggleFavorite(tripId, stopId) {
    const current = get().itineraries[tripId];
    if (!current) return;
    const favoriteStopIds = current.favoriteStopIds.includes(stopId)
      ? current.favoriteStopIds.filter((id) => id !== stopId)
      : [...current.favoriteStopIds, stopId];
    set({ itineraries: { ...get().itineraries, [tripId]: { ...current, favoriteStopIds } } });
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

  applySuggestion(tripId, suggestion) {
    const current = get().itineraries[tripId];
    if (!current) return;
    const activeVersion = current.versions.find((v) => v.id === current.activeVersionId);
    if (!activeVersion) return;

    const days = activeVersion.days.map((day) => {
      if (day.id !== suggestion.dayId) return day;
      const kept = suggestion.stopId ? day.stops.filter((s) => s.id !== suggestion.stopId) : day.stops;
      // A suggested stop has no real place behind it — it inherits the
      // replaced stop's coordinate (or the day's first stop, absent that)
      // as a plausible position rather than {0,0}.
      const fallbackCoordinate = day.stops.find((s) => s.id === suggestion.stopId)?.coordinate ?? day.stops[0]?.coordinate;
      const added: Stop[] = fallbackCoordinate
        ? suggestion.diff.addedStopNames.map((name, i) => ({
            id: `stop_suggested_${Date.now()}_${i}`,
            name,
            kind: "visit" as const,
            description: "Ajouté suite à une suggestion de recalcul.",
            coordinate: fallbackCoordinate,
            driveTimeMinFromPrev: null,
            priceEur: null,
          }))
        : [];
      return { ...day, stops: [...kept, ...added] };
    });

    const version: ItineraryVersion = {
      id: `version_${Date.now()}_${Math.round(Math.random() * 1000)}`,
      label: suggestion.title,
      createdAt: Date.now(),
      days,
      totalDistanceKm: Math.max(0, activeVersion.totalDistanceKm + suggestion.diff.deltaKm),
      totalBudgetEur: Math.max(0, activeVersion.totalBudgetEur + suggestion.diff.deltaEur),
    };
    const updated: Itinerary = {
      ...current,
      versions: [...current.versions, version],
      activeVersionId: version.id,
    };
    set({ itineraries: { ...get().itineraries, [tripId]: updated } });
  },

  undoLastVersion(tripId) {
    const current = get().itineraries[tripId];
    if (!current || current.versions.length < 2) return;
    const previous = current.versions[current.versions.length - 2];
    set({ itineraries: { ...get().itineraries, [tripId]: { ...current, activeVersionId: previous.id } } });
  },
}));
