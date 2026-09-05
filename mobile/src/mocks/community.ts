import type { ImageSourcePropType } from "react-native";

import type { GeneratedItinerary } from "./itineraries";
import { BASE_ITINERARIES } from "./itineraries";

export type Season = "printemps" | "ete" | "automne" | "hiver";

export interface CommunityAuthor {
  id: string;
  name: string;
  badges: string[];
  spotsContributed: number;
}

export interface CommunityReview {
  id: string;
  authorName: string;
  ratingOutOf5: number;
  comment: string;
}

export interface CommunityTrip {
  id: string;
  title: string;
  country: string;
  vehicleType: "van" | "fourgon" | "camping_car" | "heavy_truck" | "converted_car";
  season: Season;
  durationNights: number;
  budgetEur: number;
  ratingOutOf5: number;
  cover: ImageSourcePropType;
  author: CommunityAuthor;
  itinerary: GeneratedItinerary;
  reviews: CommunityReview[];
}

function unsplash(photoId: string): ImageSourcePropType {
  return { uri: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=500&q=70` };
}

// Reusing the same 5 verified-free Unsplash photos already sourced for
// tripsStore's filler covers, cycled — a sixth research pass for entries
// that mainly show as feed thumbnails isn't worth it.
const COVERS = [
  unsplash("photo-1685239159517-8a345f04ae02"),
  unsplash("photo-1695609861021-91cba5246953"),
  unsplash("photo-1736319552159-3b8a3ed1e17f"),
  unsplash("photo-1762854215339-55b9701f7f84"),
  unsplash("photo-1676634277252-047112f14b60"),
];

const AUTHORS: CommunityAuthor[] = [
  { id: "author_1", name: "Camille R.", badges: ["100+ km parcourus", "Contributeur vérifié"], spotsContributed: 14 },
  { id: "author_2", name: "Thomas L.", badges: ["Explorateur Espagne"], spotsContributed: 6 },
  { id: "author_3", name: "Sophie & Marc", badges: ["Voyage en famille", "5 voyages publiés"], spotsContributed: 22 },
  { id: "author_4", name: "Nico Van Life", badges: ["Contributeur vérifié", "Ambassadeur Roovia"], spotsContributed: 41 },
];

const SEASONS: Season[] = ["printemps", "ete", "automne", "hiver"];
const VEHICLES: CommunityTrip["vehicleType"][] = ["van", "fourgon", "camping_car", "heavy_truck", "converted_car"];

const TITLES = [
  "Espagne côtière en 10 jours",
  "Alpes & Provence, la boucle parfaite",
  "Portugal express entre amis",
  "Andalousie hors saison",
  "Nord de l'Espagne et Pays Basque",
  "Une semaine dans les Gorges du Verdon",
  "Tour des Pyrénées en famille",
  "Toscane et Cinque Terre en van",
  "Côte Atlantique, de Biarritz à Lisbonne",
  "Découverte des Picos de Europa",
  "Road trip en amoureux, Provence",
  "Camping-car et randonnées, Chamonix",
  "Algarve en basse saison",
  "Weekend improvisé en Dordogne",
  "Traversée du Portugal, nord au sud",
  "Aventure en famille, Sud de la France",
];

export const COMMUNITY_TRIPS: CommunityTrip[] = TITLES.map((title, i) => {
  const base = BASE_ITINERARIES[i % BASE_ITINERARIES.length];
  const author = AUTHORS[i % AUTHORS.length];
  return {
    id: `community_${i + 1}`,
    title,
    country: base.destination,
    vehicleType: VEHICLES[i % VEHICLES.length],
    season: SEASONS[i % SEASONS.length],
    durationNights: base.days.length + (i % 3),
    budgetEur: base.totalBudgetEur + i * 35,
    ratingOutOf5: Math.round((3.6 + (i % 5) * 0.3) * 10) / 10,
    cover: COVERS[i % COVERS.length],
    author,
    itinerary: base,
    reviews: [
      { id: `review_${i}_1`, authorName: "Julie D.", ratingOutOf5: 5, comment: "Itinéraire parfait, on a adapté 2-3 étapes mais la base est top." },
      { id: `review_${i}_2`, authorName: "Marc P.", ratingOutOf5: 4, comment: "Très bien pensé, quelques routes étroites pour un grand camping-car." },
    ],
  };
});
