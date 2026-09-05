import type { ImageSourcePropType } from "react-native";
import { create } from "zustand";

export type TripStatus = "draft" | "upcoming" | "in_progress" | "past";

export interface Trip {
  id: string;
  title: string;
  destination: string;
  /** Local `require()` for the two trips with real supplied art; a remote
   * Unsplash `{uri}` placeholder for the rest — same tradeoff as before,
   * just now mixed rather than uniform, since only two covers exist yet. */
  cover: ImageSourcePropType;
  /** Pre-formatted French display strings, not Date objects — this is
   * static seed content, not something the UI needs to compute against. */
  dateRange: string | null;
  distanceKm: number | null;
  budgetEur: number | null;
  status: TripStatus;
  archived: boolean;
  /** "Day 8 of 19" — only meaningful mid-trip. Stored, not computed from
   * `dateRange`, same reasoning as `dateRange` itself: static seed content. */
  dayProgress: { current: number; total: number } | null;
}

function unsplash(photoId: string): ImageSourcePropType {
  return { uri: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=500&q=70` };
}

// The five verified-free Unsplash photos already sourced for the app —
// reused across the past/draft filler trips below rather than researching
// seven more just for entries that mostly only ever show as a count.
const FILLER_COVERS = [
  unsplash("photo-1685239159517-8a345f04ae02"), // canyon road
  unsplash("photo-1695609861021-91cba5246953"), // Route 66 sign
  unsplash("photo-1736319552159-3b8a3ed1e17f"), // van, mountains
  unsplash("photo-1762854215339-55b9701f7f84"), // Étretat cliffs
  unsplash("photo-1676634277252-047112f14b60"), // tea + map
];

const SEED_TRIPS: Trip[] = [
  // The two trips with real supplied cover art — exact mock data as given
  // (title, dates, distance, budget, day-progress).
  {
    id: "atlantic-escape",
    title: "Atlantic Escape",
    destination: "Côte Atlantique, France",
    cover: require("../../assets/images/trips/roovia-trip-atlantic-escape.png"),
    dateRange: "04 – 14 sept",
    distanceKm: 1240,
    budgetEur: 1580,
    status: "in_progress",
    archived: false,
    dayProgress: { current: 6, total: 11 },
  },
  {
    id: "alpine-weekend",
    title: "Alpine Weekend",
    destination: "Alpes, France",
    cover: require("../../assets/images/trips/roovia-trip-alpine-weekend.png"),
    dateRange: "18 – 22 oct. 2026",
    distanceKm: 620,
    budgetEur: 740,
    status: "upcoming",
    archived: false,
    dayProgress: null,
  },

  // Past (7) — filtered-view content, not just a count, so each gets real
  // (if unresearched-cover) data rather than being a title-only stub.
  {
    id: "etretat",
    title: "Falaises d'Étretat",
    destination: "Étretat, Normandie",
    cover: FILLER_COVERS[3],
    dateRange: "10 – 20 juil. 2026",
    distanceKm: 540,
    budgetEur: 610,
    status: "past",
    archived: false,
    dayProgress: null,
  },
  {
    id: "verdon",
    title: "Boucle des Gorges du Verdon",
    destination: "Gorges du Verdon, France",
    cover: FILLER_COVERS[0],
    dateRange: "3 – 15 juin 2026",
    distanceKm: 620,
    budgetEur: 780,
    status: "past",
    archived: false,
    dayProgress: null,
  },
  {
    id: "dordogne",
    title: "Week-end en Dordogne",
    destination: "Dordogne, France",
    cover: FILLER_COVERS[1],
    dateRange: "22 – 24 mai 2026",
    distanceKm: 380,
    budgetEur: 420,
    status: "past",
    archived: false,
    dayProgress: null,
  },
  {
    id: "pyrenees",
    title: "Traversée des Pyrénées",
    destination: "Pyrénées, France",
    cover: FILLER_COVERS[2],
    dateRange: "12 – 19 avril 2026",
    distanceKm: 710,
    budgetEur: 890,
    status: "past",
    archived: false,
    dayProgress: null,
  },
  {
    id: "pays-basque",
    title: "Côte basque",
    destination: "Pays basque, France",
    cover: FILLER_COVERS[4],
    dateRange: "1 – 6 mars 2026",
    distanceKm: 460,
    budgetEur: 520,
    status: "past",
    archived: false,
    dayProgress: null,
  },
  {
    id: "toscane",
    title: "Toscane en van",
    destination: "Toscane, Italie",
    cover: FILLER_COVERS[0],
    dateRange: "14 – 24 sept. 2025",
    distanceKm: 980,
    budgetEur: 1120,
    status: "past",
    archived: false,
    dayProgress: null,
  },
  {
    id: "andalousie",
    title: "Andalousie express",
    destination: "Andalousie, Espagne",
    cover: FILLER_COVERS[1],
    dateRange: "5 – 12 nov. 2025",
    distanceKm: 1340,
    budgetEur: 1490,
    status: "past",
    archived: false,
    dayProgress: null,
  },

  // Drafts (3)
  {
    id: "ecosse",
    title: "Road trip Écosse",
    destination: "Écosse, Royaume-Uni",
    cover: FILLER_COVERS[4],
    dateRange: null,
    distanceKm: null,
    budgetEur: null,
    status: "draft",
    archived: false,
    dayProgress: null,
  },
  {
    id: "islande",
    title: "Islande en 10 jours",
    destination: "Islande",
    cover: FILLER_COVERS[2],
    dateRange: null,
    distanceKm: null,
    budgetEur: null,
    status: "draft",
    archived: false,
    dayProgress: null,
  },
  {
    id: "norvege",
    title: "Norvège, les fjords",
    destination: "Norvège",
    cover: FILLER_COVERS[3],
    dateRange: null,
    distanceKm: null,
    budgetEur: null,
    status: "draft",
    archived: false,
    dayProgress: null,
  },
];

interface TripsState {
  trips: Trip[];
  refreshing: boolean;
  refresh(): Promise<void>;
  duplicate(id: string): void;
  archive(id: string): void;
  remove(id: string): void;
  /** The one entry point AI generation (§3) uses to land a result on Home — returns the new trip's id. */
  addGenerated(input: { title: string; destination: string; dateRange: string | null; distanceKm: number; budgetEur: number }): string;
  /** upcoming/draft → in_progress. `totalDays` seeds day-progress at day 1. */
  startTrip(id: string, totalDays: number): void;
  /** in_progress → past. */
  finishTrip(id: string): void;
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: SEED_TRIPS,
  refreshing: false,

  async refresh() {
    set({ refreshing: true });
    // No server yet — the delay is what makes the pull-to-refresh gesture
    // read as real rather than instant-and-therefore-invisible.
    await new Promise((resolve) => setTimeout(resolve, 700));
    set({ refreshing: false });
  },

  duplicate(id) {
    const source = get().trips.find((t) => t.id === id);
    if (!source) return;
    const copy: Trip = {
      ...source,
      id: `${source.id}-copie-${Date.now()}`,
      title: `${source.title} (copie)`,
      status: "draft",
      dateRange: null,
      dayProgress: null,
    };
    set({ trips: [copy, ...get().trips] });
  },

  archive(id) {
    set({ trips: get().trips.map((t) => (t.id === id ? { ...t, archived: true } : t)) });
  },

  remove(id) {
    set({ trips: get().trips.filter((t) => t.id !== id) });
  },

  addGenerated(input) {
    const id = `trip_${Date.now()}`;
    const trip: Trip = {
      id,
      title: input.title,
      destination: input.destination,
      cover: FILLER_COVERS[get().trips.length % FILLER_COVERS.length],
      dateRange: input.dateRange,
      distanceKm: input.distanceKm,
      budgetEur: input.budgetEur,
      status: "upcoming",
      archived: false,
      dayProgress: null,
    };
    set({ trips: [trip, ...get().trips] });
    return id;
  },

  startTrip(id, totalDays) {
    set({
      trips: get().trips.map((t) =>
        t.id === id ? { ...t, status: "in_progress", dayProgress: { current: 1, total: totalDays } } : t,
      ),
    });
  },

  finishTrip(id) {
    set({
      trips: get().trips.map((t) => (t.id === id ? { ...t, status: "past", dayProgress: null } : t)),
    });
  },
}));
