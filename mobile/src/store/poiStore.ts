import { create } from "zustand";

import type { LatLng, PoiKind } from "../features/map/types";
import type { Poi } from "../mocks/pois";

// All 9 kinds, "market" included — todo.md lists "Local markets" as its own
// toggleable layer even though it shares `viewpoint`'s pin color (see
// `CATEGORY_BY_KIND`'s doc); the two are independent concerns.
const ALL_KINDS: PoiKind[] = ["fuel", "water", "dumpStation", "toilets", "bivouac", "campsite", "viewpoint", "market", "parking"];

export interface PoiFilters {
  freeOnly: boolean;
  openNowOnly: boolean;
  fitsVehicle: boolean;
  minRating: number;
}

const defaultFilters: PoiFilters = { freeOnly: false, openNowOnly: false, fitsVehicle: false, minRating: 0 };

interface PoiState {
  visibleKinds: PoiKind[];
  filters: PoiFilters;
  favoriteIds: string[];
  reportedIds: string[];
  /** User-submitted POIs — `source: "user"` and unmoderated, same shape a real submission would take (see IMPLEMENTATION_PLAN.md §6's "Community POIs... source=user + moderation state"). Rendered alongside the curated set, never persisted server-side here. */
  submitted: Poi[];
  toggleKind(kind: PoiKind): void;
  setFilters(patch: Partial<PoiFilters>): void;
  toggleFavorite(id: string): void;
  report(id: string): void;
  submit(input: { name: string; kind: PoiKind; description: string; coordinate: LatLng }): void;
}

export const usePoiStore = create<PoiState>((set, get) => ({
  visibleKinds: ALL_KINDS,
  filters: defaultFilters,
  favoriteIds: [],
  reportedIds: [],
  submitted: [],

  toggleKind(kind) {
    const current = get().visibleKinds;
    set({ visibleKinds: current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind] });
  },

  setFilters(patch) {
    set({ filters: { ...get().filters, ...patch } });
  },

  toggleFavorite(id) {
    const current = get().favoriteIds;
    set({ favoriteIds: current.includes(id) ? current.filter((f) => f !== id) : [...current, id] });
  },

  report(id) {
    if (get().reportedIds.includes(id)) return;
    set({ reportedIds: [...get().reportedIds, id] });
  },

  submit(input) {
    const poi: Poi = {
      id: `poi_user_${Date.now()}`,
      name: input.name,
      kind: input.kind,
      coordinate: input.coordinate,
      description: input.description,
      priceEur: null,
      ratingOutOf5: 0,
      openNow: true,
      lastVerified: new Date().toISOString().slice(0, 10),
    };
    set({ submitted: [...get().submitted, poi] });
  },
}));
