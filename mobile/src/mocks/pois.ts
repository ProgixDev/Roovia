import type { LatLng, PoiKind } from "../features/map/types";

export interface Poi {
  id: string;
  name: string;
  kind: PoiKind;
  coordinate: LatLng;
  description: string;
  priceEur: number | null;
  ratingOutOf5: number;
  openNow: boolean;
  lastVerified: string;
  maxHeightM?: number;
}

/**
 * ~50 POIs across the same France→Spain→Portugal corridor as
 * `mocks/places.ts` and `mocks/itineraries.ts` — a real dataset the
 * services map's layers, filters, and "around me" sheet all draw from,
 * standing in for the real OpenStreetMap/Overpass pipeline in
 * IMPLEMENTATION_PLAN.md §6.
 */
export const POIS: Poi[] = [
  { id: "poi_fuel_1", name: "Station Total Biarritz", kind: "fuel", coordinate: { latitude: 43.48, longitude: -1.56 }, description: "Gazole B7, station 24h/24.", priceEur: 1.72, ratingOutOf5: 4.1, openNow: true, lastVerified: "2026-08-20" },
  { id: "poi_fuel_2", name: "Station Repsol Bilbao", kind: "fuel", coordinate: { latitude: 43.27, longitude: -2.92 }, description: "Gazole et AdBlue, aire poids lourds.", priceEur: 1.65, ratingOutOf5: 4.0, openNow: true, lastVerified: "2026-08-11" },
  { id: "poi_fuel_3", name: "Station BP Santander", kind: "fuel", coordinate: { latitude: 43.46, longitude: -3.81 }, description: "Prix compétitif, boutique ouverte tard.", priceEur: 1.61, ratingOutOf5: 3.9, openNow: false, lastVerified: "2026-07-30" },
  { id: "poi_fuel_4", name: "Station Galp Porto", kind: "fuel", coordinate: { latitude: 41.16, longitude: -8.63 }, description: "Bornes électriques également disponibles.", priceEur: 1.7, ratingOutOf5: 4.3, openNow: true, lastVerified: "2026-08-25" },
  { id: "poi_fuel_5", name: "Station Cepsa Madrid Nord", kind: "fuel", coordinate: { latitude: 40.55, longitude: -3.65 }, description: "Grande aire, restauration sur place.", priceEur: 1.68, ratingOutOf5: 4.0, openNow: true, lastVerified: "2026-08-02" },

  { id: "poi_water_1", name: "Point d'eau Zarautz", kind: "water", coordinate: { latitude: 43.283, longitude: -2.17 }, description: "Fontaine potable municipale, gratuite.", priceEur: null, ratingOutOf5: 4.4, openNow: true, lastVerified: "2026-08-18" },
  { id: "poi_water_2", name: "Point d'eau Camping Los Picos", kind: "water", coordinate: { latitude: 43.18, longitude: -4.85 }, description: "Borne sur le camping, accès visiteurs toléré.", priceEur: null, ratingOutOf5: 4.0, openNow: true, lastVerified: "2026-07-15" },
  { id: "poi_water_3", name: "Fontaine place centrale Annecy", kind: "water", coordinate: { latitude: 45.899, longitude: 6.129 }, description: "Eau potable testée, très fréquentée l'été.", priceEur: null, ratingOutOf5: 4.6, openNow: true, lastVerified: "2026-08-22" },
  { id: "poi_water_4", name: "Point d'eau Nazaré", kind: "water", coordinate: { latitude: 39.6, longitude: -9.07 }, description: "Borne sur le parking du phare.", priceEur: null, ratingOutOf5: 3.8, openNow: true, lastVerified: "2026-06-30" },

  { id: "poi_dump_1", name: "Aire de vidange Comillas", kind: "dumpStation", coordinate: { latitude: 43.38, longitude: -4.29 }, description: "Vidange eaux grises et noires, gratuite.", priceEur: null, ratingOutOf5: 4.2, openNow: true, lastVerified: "2026-08-05" },
  { id: "poi_dump_2", name: "Aire de service Moustiers", kind: "dumpStation", coordinate: { latitude: 43.85, longitude: 6.22 }, description: "Jetons en vente à l'office de tourisme.", priceEur: 3, ratingOutOf5: 4.0, openNow: true, lastVerified: "2026-08-14" },
  { id: "poi_dump_3", name: "Aire de vidange Vila do Conde", kind: "dumpStation", coordinate: { latitude: 41.35, longitude: -8.74 }, description: "Aire complète, très bien entretenue.", priceEur: null, ratingOutOf5: 4.5, openNow: true, lastVerified: "2026-08-19" },

  { id: "poi_toilets_1", name: "Toilettes publiques Saint-Sébastien", kind: "toilets", coordinate: { latitude: 43.318, longitude: -1.981 }, description: "Ouvertes toute la journée, entretien correct.", priceEur: null, ratingOutOf5: 3.7, openNow: true, lastVerified: "2026-08-09" },
  { id: "poi_toilets_2", name: "Toilettes plage Zarautz", kind: "toilets", coordinate: { latitude: 43.284, longitude: -2.169 }, description: "Accès PMR, douche extérieure à proximité.", priceEur: null, ratingOutOf5: 4.0, openNow: true, lastVerified: "2026-08-01" },
  { id: "poi_toilets_3", name: "Toilettes Nazaré front de mer", kind: "toilets", coordinate: { latitude: 39.602, longitude: -9.071 }, description: "Payant hors saison basse.", priceEur: 0.5, ratingOutOf5: 3.5, openNow: true, lastVerified: "2026-07-20" },

  { id: "poi_bivouac_1", name: "Bivouac Costa Verde", kind: "bivouac", coordinate: { latitude: 43.4, longitude: -4.2 }, description: "Spot toléré, vue mer, pas de services.", priceEur: null, ratingOutOf5: 4.3, openNow: true, lastVerified: "2026-08-16" },
  { id: "poi_bivouac_2", name: "Bivouac Col de la Forclaz", kind: "bivouac", coordinate: { latitude: 45.83, longitude: 6.27 }, description: "Prisé des parapentistes, calme en semaine.", priceEur: null, ratingOutOf5: 4.5, openNow: true, lastVerified: "2026-08-12" },
  { id: "poi_bivouac_3", name: "Bivouac Praia do Norte", kind: "bivouac", coordinate: { latitude: 39.61, longitude: -9.08 }, description: "Toléré hors saison, à vérifier sur place.", priceEur: null, ratingOutOf5: 3.9, openNow: true, lastVerified: "2026-06-28" },

  { id: "poi_campsite_1", name: "Camping Les Deux Glaciers", kind: "campsite", coordinate: { latitude: 45.92, longitude: 6.87 }, description: "Vue Mont-Blanc, sanitaires chauffés, 220V.", priceEur: 28, ratingOutOf5: 4.7, openNow: true, lastVerified: "2026-08-21" },
  { id: "poi_campsite_2", name: "Camping Los Picos", kind: "campsite", coordinate: { latitude: 43.18, longitude: -4.85 }, description: "Douches chaudes, vidange sur place.", priceEur: 22, ratingOutOf5: 4.2, openNow: true, lastVerified: "2026-08-06" },
  { id: "poi_campsite_3", name: "Camping Lisboa", kind: "campsite", coordinate: { latitude: 38.75, longitude: -9.23 }, description: "Navette centre-ville, sanitaires complets.", priceEur: 24, ratingOutOf5: 4.1, openNow: true, lastVerified: "2026-07-28" },
  { id: "poi_campsite_4", name: "Camping Verdon Nature", kind: "campsite", coordinate: { latitude: 43.83, longitude: 6.24 }, description: "Piscine, épicerie, ombragé.", priceEur: 26, ratingOutOf5: 4.4, openNow: true, lastVerified: "2026-08-17" },

  { id: "poi_viewpoint_1", name: "Route des Crêtes", kind: "viewpoint", coordinate: { latitude: 43.75, longitude: 6.33 }, description: "Point de vue sublime sur les Gorges du Verdon.", priceEur: null, ratingOutOf5: 4.9, openNow: true, lastVerified: "2026-08-13" },
  { id: "poi_viewpoint_2", name: "Mirador Picos de Europa", kind: "viewpoint", coordinate: { latitude: 43.19, longitude: -4.83 }, description: "Départ de randonnée, vue à 360°.", priceEur: null, ratingOutOf5: 4.8, openNow: true, lastVerified: "2026-08-04" },
  { id: "poi_market_1", name: "Marché de Santillana del Mar", kind: "market", coordinate: { latitude: 43.39, longitude: -4.11 }, description: "Produits locaux, tous les matins.", priceEur: null, ratingOutOf5: 4.3, openNow: false, lastVerified: "2026-07-22" },
  { id: "poi_market_2", name: "Marché de Nazaré", kind: "market", coordinate: { latitude: 39.605, longitude: -9.068 }, description: "Poissons frais et fruits, tôt le matin.", priceEur: null, ratingOutOf5: 4.1, openNow: false, lastVerified: "2026-06-25" },

  { id: "poi_parking_1", name: "Parking souterrain Guggenheim", kind: "parking", coordinate: { latitude: 43.269, longitude: -2.934 }, description: "Pratique mais hauteur limitée.", priceEur: 2.4, ratingOutOf5: 3.6, openNow: true, lastVerified: "2026-08-10", maxHeightM: 2.1 },
  { id: "poi_parking_2", name: "Parking relais Annecy", kind: "parking", coordinate: { latitude: 45.902, longitude: 6.121 }, description: "Grand parking extérieur, aucune limite de hauteur.", priceEur: 1.5, ratingOutOf5: 3.9, openNow: true, lastVerified: "2026-08-15" },
  { id: "poi_parking_3", name: "Parking couvert Lisbonne Centre", kind: "parking", coordinate: { latitude: 38.716, longitude: -9.14 }, description: "Central mais bas de plafond.", priceEur: 3, ratingOutOf5: 3.4, openNow: true, lastVerified: "2026-07-05", maxHeightM: 1.9 },
];

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
