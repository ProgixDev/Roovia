import { create } from "zustand";

export type TripStatus = "draft" | "upcoming" | "in_progress" | "past";

export interface Trip {
  id: string;
  title: string;
  destination: string;
  /** Remote Unsplash URL — placeholder covers per the client's own call
   * ("use images from online like Unsplash for now"), swappable for real
   * trip photos later without touching anything but this seed data. */
  coverUri: string;
  /** Pre-formatted French display strings, not Date objects — this is
   * static seed content, not something the UI needs to compute against. */
  dateRange: string | null;
  distanceKm: number | null;
  budgetEur: number | null;
  status: TripStatus;
  archived: boolean;
}

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=500&q=70`;
}

const SEED_TRIPS: Trip[] = [
  {
    id: "verdon",
    title: "Boucle des Gorges du Verdon",
    destination: "Gorges du Verdon, France",
    coverUri: unsplash("photo-1685239159517-8a345f04ae02"),
    dateRange: "12 – 28 oct. 2026",
    distanceKm: 620,
    budgetEur: 780,
    status: "upcoming",
    archived: false,
  },
  {
    id: "route66",
    title: "Route 66 — la grande traversée",
    destination: "Route 66, États-Unis",
    coverUri: unsplash("photo-1695609861021-91cba5246953"),
    dateRange: "3 – 24 mai 2027",
    distanceKm: 3940,
    budgetEur: 4200,
    status: "upcoming",
    archived: false,
  },
  {
    id: "yosemite",
    title: "Yosemite en van",
    destination: "Yosemite, Californie",
    coverUri: unsplash("photo-1736319552159-3b8a3ed1e17f"),
    dateRange: "28 août – 15 sept. 2026",
    distanceKm: 890,
    budgetEur: 1450,
    status: "in_progress",
    archived: false,
  },
  {
    id: "etretat",
    title: "Falaises d'Étretat",
    destination: "Étretat, Normandie",
    coverUri: unsplash("photo-1762854215339-55b9701f7f84"),
    dateRange: "10 – 20 juil. 2026",
    distanceKm: 540,
    budgetEur: 610,
    status: "past",
    archived: false,
  },
  {
    id: "ecosse",
    title: "Road trip Écosse",
    destination: "Écosse, Royaume-Uni",
    coverUri: unsplash("photo-1676634277252-047112f14b60"),
    dateRange: null,
    distanceKm: null,
    budgetEur: null,
    status: "draft",
    archived: false,
  },
];

interface TripsState {
  trips: Trip[];
  refreshing: boolean;
  refresh(): Promise<void>;
  duplicate(id: string): void;
  archive(id: string): void;
  remove(id: string): void;
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
    };
    set({ trips: [copy, ...get().trips] });
  },

  archive(id) {
    set({ trips: get().trips.map((t) => (t.id === id ? { ...t, archived: true } : t)) });
  },

  remove(id) {
    set({ trips: get().trips.filter((t) => t.id !== id) });
  },
}));
