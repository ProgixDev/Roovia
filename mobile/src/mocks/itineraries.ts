import type { LatLng } from "../features/map/types";

export type StopKind = "visit" | "activity" | "sleep_free" | "sleep_paid" | "service";

export interface Stop {
  id: string;
  name: string;
  kind: StopKind;
  description: string;
  coordinate: LatLng;
  driveTimeMinFromPrev: number | null;
  priceEur: number | null;
  /** Minutes added versus the direct route to reach this stop — omitted for a stop that's simply along the way. */
  detourMinutes?: number;
  ratingOutOf5?: number;
  hours?: string;
  /** A clearance this specific stop won't take — checked against the active vehicle by `lib/vehicleFit`. Omitted for almost every stop; this is deliberately rare. */
  maxHeightM?: number;
}

export interface TripDay {
  id: string;
  index: number;
  stops: Stop[];
}

export interface GeneratedItinerary {
  title: string;
  destination: string;
  days: TripDay[];
  totalDistanceKm: number;
  totalBudgetEur: number;
}

let seq = 0;
const nextId = (prefix: string) => `${prefix}_${++seq}`;

/**
 * Three hand-authored base trips, each with a real day-by-day shape — every
 * result the mocked generator (§3) can produce is one of these, or one of
 * these run through `applyRefinement` below. Coordinates sit on the same
 * France→Spain→Portugal corridor as `mocks/places.ts` so a real `RooviaMap`
 * route can draw them.
 */
export const BASE_ITINERARIES: GeneratedItinerary[] = [
  {
    title: "Espagne côtière",
    destination: "Espagne",
    totalDistanceKm: 1180,
    totalBudgetEur: 1450,
    days: [
      {
        id: nextId("day"),
        index: 1,
        stops: [
          { id: nextId("stop"), name: "Départ — Biarritz", kind: "visit", description: "Dernier plein avant la frontière, vue sur la Grande Plage.", coordinate: { latitude: 43.4832, longitude: -1.5586 }, driveTimeMinFromPrev: null, priceEur: null },
          { id: nextId("stop"), name: "Saint-Sébastien", kind: "visit", description: "La Concha et les pintxos de la vieille ville.", coordinate: { latitude: 43.3183, longitude: -1.9812 }, driveTimeMinFromPrev: 55, priceEur: null },
          { id: nextId("stop"), name: "Aire de Zarautz", kind: "sleep_paid", description: "Aire de services face à la plage, bornes eau/vidange.", coordinate: { latitude: 43.2833, longitude: -2.1706 }, driveTimeMinFromPrev: 25, priceEur: 14, ratingOutOf5: 4.2, hours: "24h/24" },
        ],
      },
      {
        id: nextId("day"),
        index: 2,
        stops: [
          { id: nextId("stop"), name: "Bilbao — Guggenheim", kind: "visit", description: "Musée et balade le long du Nervión.", coordinate: { latitude: 43.2687, longitude: -2.9337 }, driveTimeMinFromPrev: 70, priceEur: 16, detourMinutes: 25, ratingOutOf5: 4.6, hours: "10h–19h", maxHeightM: 2.1 },
          { id: nextId("stop"), name: "Station Repsol A-8", kind: "service", description: "Carburant + point d'eau potable.", coordinate: { latitude: 43.35, longitude: -3.6 }, driveTimeMinFromPrev: 90, priceEur: null },
          { id: nextId("stop"), name: "Bivouac Costa Verde", kind: "sleep_free", description: "Spot gratuit toléré, vue sur la côte.", coordinate: { latitude: 43.4, longitude: -4.2 }, driveTimeMinFromPrev: 40, priceEur: null },
        ],
      },
      {
        id: nextId("day"),
        index: 3,
        stops: [
          { id: nextId("stop"), name: "Randonnée Picos de Europa", kind: "activity", description: "Boucle de 3h, dénivelé modéré.", coordinate: { latitude: 43.19, longitude: -4.83 }, driveTimeMinFromPrev: 60, priceEur: null },
          { id: nextId("stop"), name: "Camping Los Picos", kind: "sleep_paid", description: "Douches chaudes, 220V, vidange sur place.", coordinate: { latitude: 43.18, longitude: -4.85 }, driveTimeMinFromPrev: 10, priceEur: 22 },
        ],
      },
      {
        id: nextId("day"),
        index: 4,
        stops: [
          { id: nextId("stop"), name: "Santander — front de mer", kind: "visit", description: "Playa del Sardinero et le Palacio de la Magdalena.", coordinate: { latitude: 43.4623, longitude: -3.81 }, driveTimeMinFromPrev: 80, priceEur: null },
          { id: nextId("stop"), name: "Marché de Santillana del Mar", kind: "visit", description: "Village médiéval, produits locaux.", coordinate: { latitude: 43.39, longitude: -4.11 }, driveTimeMinFromPrev: 35, priceEur: null },
          { id: nextId("stop"), name: "Aire de Comillas", kind: "sleep_paid", description: "Aire calme, vidange et eau incluses.", coordinate: { latitude: 43.38, longitude: -4.29 }, driveTimeMinFromPrev: 15, priceEur: 12 },
        ],
      },
    ],
  },
  {
    title: "Alpes & Provence",
    destination: "France",
    totalDistanceKm: 640,
    totalBudgetEur: 820,
    days: [
      {
        id: nextId("day"),
        index: 1,
        stops: [
          { id: nextId("stop"), name: "Annecy — le lac", kind: "visit", description: "Vieille ville et bord du lac à vélo.", coordinate: { latitude: 45.8992, longitude: 6.1294 }, driveTimeMinFromPrev: null, priceEur: null },
          { id: nextId("stop"), name: "Bivouac Col de la Forclaz", kind: "sleep_free", description: "Point de vue sur le lac, spot connu des parapentistes.", coordinate: { latitude: 45.83, longitude: 6.27 }, driveTimeMinFromPrev: 30, priceEur: null },
        ],
      },
      {
        id: nextId("day"),
        index: 2,
        stops: [
          { id: nextId("stop"), name: "Chamonix — Mer de Glace", kind: "activity", description: "Randonnée facile avec vue sur le glacier.", coordinate: { latitude: 45.9237, longitude: 6.8694 }, driveTimeMinFromPrev: 75, priceEur: 35 },
          { id: nextId("stop"), name: "Camping Les Deux Glaciers", kind: "sleep_paid", description: "Vue Mont-Blanc, sanitaires chauffés.", coordinate: { latitude: 45.92, longitude: 6.87 }, driveTimeMinFromPrev: 5, priceEur: 28 },
        ],
      },
      {
        id: nextId("day"),
        index: 3,
        stops: [
          { id: nextId("stop"), name: "Gorges du Verdon", kind: "visit", description: "Route des Crêtes, point sublime.", coordinate: { latitude: 43.75, longitude: 6.33 }, driveTimeMinFromPrev: 210, priceEur: null },
          { id: nextId("stop"), name: "Aire de Moustiers-Sainte-Marie", kind: "sleep_paid", description: "Vidange, eau, 220V.", coordinate: { latitude: 43.85, longitude: 6.22 }, driveTimeMinFromPrev: 20, priceEur: 15 },
        ],
      },
    ],
  },
  {
    title: "Portugal express",
    destination: "Portugal",
    totalDistanceKm: 520,
    totalBudgetEur: 610,
    days: [
      {
        id: nextId("day"),
        index: 1,
        stops: [
          { id: nextId("stop"), name: "Porto — Ribeira", kind: "visit", description: "Quartier historique, caves à Porto de l'autre côté du fleuve.", coordinate: { latitude: 41.1579, longitude: -8.6291 }, driveTimeMinFromPrev: null, priceEur: null },
          { id: nextId("stop"), name: "Aire de Vila do Conde", kind: "sleep_paid", description: "Bord de mer, services complets.", coordinate: { latitude: 41.35, longitude: -8.74 }, driveTimeMinFromPrev: 35, priceEur: 10 },
        ],
      },
      {
        id: nextId("day"),
        index: 2,
        stops: [
          { id: nextId("stop"), name: "Nazaré — les vagues géantes", kind: "visit", description: "Le phare et le point de vue sur les rouleaux.", coordinate: { latitude: 39.6033, longitude: -9.0705 }, driveTimeMinFromPrev: 150, priceEur: null },
          { id: nextId("stop"), name: "Bivouac Praia do Norte", kind: "sleep_free", description: "Toléré hors saison, à vérifier sur place.", coordinate: { latitude: 39.61, longitude: -9.08 }, driveTimeMinFromPrev: 5, priceEur: null },
        ],
      },
      {
        id: nextId("day"),
        index: 3,
        stops: [
          { id: nextId("stop"), name: "Lisbonne — Belém", kind: "visit", description: "Tour de Belém et pastéis de nata.", coordinate: { latitude: 38.7223, longitude: -9.1393 }, driveTimeMinFromPrev: 130, priceEur: null },
          { id: nextId("stop"), name: "Camping Lisboa", kind: "sleep_paid", description: "Navette pour le centre, sanitaires complets.", coordinate: { latitude: 38.75, longitude: -9.23 }, driveTimeMinFromPrev: 20, priceEur: 24 },
        ],
      },
    ],
  },
];

export type RefinementKind = "more_hiking" | "cheaper" | "less_driving";

/**
 * A transform, not nine hand-authored variants — deterministic and honest
 * about being a mock, but it changes something real and visible each time,
 * which is what makes "refine" demo convincingly.
 */
export function applyRefinement(
  base: GeneratedItinerary,
  kind: RefinementKind,
  lockedStopIds: ReadonlySet<string> = new Set(),
): GeneratedItinerary {
  if (kind === "more_hiking") {
    const days = base.days.map((day, i) => {
      if (i % 2 !== 0) return day;
      const extra: Stop = {
        id: nextId("stop"),
        name: "Randonnée improvisée",
        kind: "activity",
        description: "Boucle courte ajoutée près de l'étape du jour.",
        coordinate: day.stops[0].coordinate,
        driveTimeMinFromPrev: 15,
        priceEur: null,
      };
      return { ...day, stops: [...day.stops.slice(0, -1), extra, day.stops[day.stops.length - 1]] };
    });
    return { ...base, title: `${base.title} (plus de rando)`, days };
  }

  if (kind === "cheaper") {
    let savedEur = 0;
    const days = base.days.map((day) => ({
      ...day,
      stops: day.stops.map((stop) => {
        // Locked stops are the one thing refine must never touch — checked
        // here, at the point of mutation, rather than reconciled afterward
        // by position: `more_hiking` inserts and `less_driving` merges days,
        // both of which shift indices, so identity has to survive inside
        // the transform itself.
        if (stop.kind !== "sleep_paid" || lockedStopIds.has(stop.id)) return stop;
        savedEur += stop.priceEur ?? 0;
        return { ...stop, kind: "sleep_free" as const, name: stop.name.replace("Camping", "Bivouac").replace("Aire de", "Spot libre —"), priceEur: null, description: "Alternative gratuite proposée à la place de l'étape payante." };
      }),
    }));
    return { ...base, title: `${base.title} (moins cher)`, days, totalBudgetEur: Math.max(0, base.totalBudgetEur - savedEur) };
  }

  // less_driving — merge the two shortest days into one, same stops, less total transit.
  const shortestPair = base.days.length >= 2 ? [base.days.length - 2, base.days.length - 1] : null;
  if (!shortestPair) return base;
  const merged: TripDay = {
    id: nextId("day"),
    index: base.days[shortestPair[0]].index,
    stops: [...base.days[shortestPair[0]].stops, ...base.days[shortestPair[1]].stops],
  };
  const days = [...base.days.slice(0, shortestPair[0]), merged].map((d, i) => ({ ...d, index: i + 1 }));
  return {
    ...base,
    title: `${base.title} (moins de route)`,
    days,
    totalDistanceKm: Math.round(base.totalDistanceKm * 0.85),
  };
}

export function pickBaseItinerary(promptOrDestination: string): GeneratedItinerary {
  const q = promptOrDestination.toLowerCase();
  if (q.includes("espagne") || q.includes("spain") || q.includes("valence") || q.includes("barcelone")) {
    return BASE_ITINERARIES[0];
  }
  if (q.includes("portugal") || q.includes("lisbonne") || q.includes("porto")) {
    return BASE_ITINERARIES[2];
  }
  return BASE_ITINERARIES[1];
}

/** Roughly where a named destination sits, for a mock itinerary's route to at least land on the right part of the map. */
const DESTINATION_CENTROIDS: { match: string; lat: number; lng: number }[] = [
  { match: "atlantique", lat: 45.9, lng: -1.2 },
  { match: "étretat", lat: 49.7, lng: 0.2 },
  { match: "normandie", lat: 49.4, lng: 0.6 },
  { match: "verdon", lat: 43.75, lng: 6.33 },
  { match: "dordogne", lat: 44.95, lng: 1.0 },
  { match: "pyrénées", lat: 42.75, lng: 0.6 },
  { match: "basque", lat: 43.3, lng: -1.6 },
  { match: "alpes", lat: 45.2, lng: 6.6 },
  { match: "toscane", lat: 43.3, lng: 11.1 },
  { match: "andalousie", lat: 37.2, lng: -4.9 },
  { match: "écosse", lat: 56.6, lng: -4.2 },
  { match: "islande", lat: 64.9, lng: -18.5 },
  { match: "norvège", lat: 61.5, lng: 7.5 },
  { match: "espagne", lat: 42.5, lng: -3.5 },
  { match: "portugal", lat: 39.5, lng: -8.5 },
];
const DEFAULT_CENTROID = { lat: 46.6, lng: 2.5 };

function centroidFor(destination: string): { lat: number; lng: number } {
  const q = destination.toLowerCase();
  const hit = DESTINATION_CENTROIDS.find((c) => q.includes(c.match));
  return hit ? { lat: hit.lat, lng: hit.lng } : DEFAULT_CENTROID;
}

const DAY_VISIT_TEMPLATES = [
  (d: string) => `Découverte de ${d}`,
  (d: string) => `Balade autour de ${d}`,
  (d: string) => `Point de vue sur ${d}`,
  (d: string) => `Marché local — ${d}`,
  (d: string) => `Randonnée près de ${d}`,
  (d: string) => `Village typique — ${d}`,
];

const OVERNIGHT_TEMPLATES: { name: string; kind: "sleep_paid" | "sleep_free"; priceEur: number | null }[] = [
  { name: "Aire de camping-car", kind: "sleep_paid", priceEur: 14 },
  { name: "Bivouac nature", kind: "sleep_free", priceEur: null },
  { name: "Camping municipal", kind: "sleep_paid", priceEur: 19 },
];

/**
 * Stands in for a real generation call: given only what a trip card already
 * shows (destination, distance, budget, a day count), it fabricates a
 * plausible day-by-day itinerary — real `GeneratedItinerary` shape, so
 * every downstream feature (budget, checklist, journal, suggestions,
 * map) treats it exactly like an itinerary a real model produced. Used to
 * seed the trips that exist before the user has ever generated anything
 * (see `tripsStore`'s `SEED_TRIPS`), so opening one doesn't hit an empty
 * "not generated yet" state.
 */
export function buildMockItinerary(params: {
  title: string;
  destination: string;
  totalDistanceKm: number;
  totalBudgetEur: number;
  dayCount: number;
}): GeneratedItinerary {
  const { title, destination, totalDistanceKm, totalBudgetEur } = params;
  const dayCount = Math.max(2, Math.min(params.dayCount, 8));
  const centroid = centroidFor(destination);
  const days: TripDay[] = [];

  for (let i = 0; i < dayCount; i++) {
    const angle = i * 0.9;
    const lat = centroid.lat + Math.sin(angle) * 0.18 + i * 0.03;
    const lng = centroid.lng + Math.cos(angle) * 0.22 + i * 0.04;
    const isLastDay = i === dayCount - 1;

    const stops: Stop[] = [
      {
        id: nextId("stop"),
        name: DAY_VISIT_TEMPLATES[i % DAY_VISIT_TEMPLATES.length](destination),
        kind: i % 3 === 2 ? "activity" : "visit",
        description: "Étape sélectionnée par l'IA à partir de votre profil et de votre itinéraire.",
        coordinate: { latitude: lat, longitude: lng },
        driveTimeMinFromPrev: i === 0 ? null : 45 + (i % 3) * 20,
        priceEur: i % 4 === 0 ? 8 : null,
      },
    ];

    if (!isLastDay) {
      const overnight = OVERNIGHT_TEMPLATES[i % OVERNIGHT_TEMPLATES.length];
      stops.push({
        id: nextId("stop"),
        name: overnight.name,
        kind: overnight.kind,
        description: "Étape pour la nuit, proposée par l'IA d'après des avis récents.",
        coordinate: { latitude: lat + 0.02, longitude: lng + 0.02 },
        driveTimeMinFromPrev: 15,
        priceEur: overnight.priceEur,
        ratingOutOf5: overnight.kind === "sleep_paid" ? Math.round((4.1 + (i % 3) * 0.2) * 10) / 10 : undefined,
      });
    }

    days.push({ id: nextId("day"), index: i + 1, stops });
  }

  return { title, destination, days, totalDistanceKm, totalBudgetEur };
}
