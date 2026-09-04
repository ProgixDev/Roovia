export interface Place {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  coordinate: { latitude: number; longitude: number };
}

/**
 * A France→Spain→Italy→Portugal corridor — enough breadth for the
 * destination autocomplete (§1) and the itinerary/map mocks (§4+) to draw
 * from the same, geographically coherent set rather than each section
 * inventing its own places.
 */
export const PLACES: Place[] = [
  { id: "fr-paris", name: "Paris", country: "France", countryCode: "FR", coordinate: { latitude: 48.8566, longitude: 2.3522 } },
  { id: "fr-lyon", name: "Lyon", country: "France", countryCode: "FR", coordinate: { latitude: 45.764, longitude: 4.8357 } },
  { id: "fr-bordeaux", name: "Bordeaux", country: "France", countryCode: "FR", coordinate: { latitude: 44.8378, longitude: -0.5792 } },
  { id: "fr-biarritz", name: "Biarritz", country: "France", countryCode: "FR", coordinate: { latitude: 43.4832, longitude: -1.5586 } },
  { id: "fr-nice", name: "Nice", country: "France", countryCode: "FR", coordinate: { latitude: 43.7102, longitude: 7.262 } },
  { id: "fr-marseille", name: "Marseille", country: "France", countryCode: "FR", coordinate: { latitude: 43.2965, longitude: 5.3698 } },
  { id: "fr-annecy", name: "Annecy", country: "France", countryCode: "FR", coordinate: { latitude: 45.8992, longitude: 6.1294 } },
  { id: "fr-chamonix", name: "Chamonix-Mont-Blanc", country: "France", countryCode: "FR", coordinate: { latitude: 45.9237, longitude: 6.8694 } },
  { id: "fr-carcassonne", name: "Carcassonne", country: "France", countryCode: "FR", coordinate: { latitude: 43.2130, longitude: 2.3491 } },
  { id: "fr-strasbourg", name: "Strasbourg", country: "France", countryCode: "FR", coordinate: { latitude: 48.5734, longitude: 7.7521 } },

  { id: "es-barcelona", name: "Barcelone", country: "Espagne", countryCode: "ES", coordinate: { latitude: 41.3874, longitude: 2.1686 } },
  { id: "es-valencia", name: "Valence", country: "Espagne", countryCode: "ES", coordinate: { latitude: 39.4699, longitude: -0.3763 } },
  { id: "es-madrid", name: "Madrid", country: "Espagne", countryCode: "ES", coordinate: { latitude: 40.4168, longitude: -3.7038 } },
  { id: "es-sevilla", name: "Séville", country: "Espagne", countryCode: "ES", coordinate: { latitude: 37.3891, longitude: -5.9845 } },
  { id: "es-granada", name: "Grenade", country: "Espagne", countryCode: "ES", coordinate: { latitude: 37.1773, longitude: -3.5986 } },
  { id: "es-san-sebastian", name: "Saint-Sébastien", country: "Espagne", countryCode: "ES", coordinate: { latitude: 43.3183, longitude: -1.9812 } },
  { id: "es-malaga", name: "Malaga", country: "Espagne", countryCode: "ES", coordinate: { latitude: 36.7213, longitude: -4.4213 } },
  { id: "es-tarifa", name: "Tarifa", country: "Espagne", countryCode: "ES", coordinate: { latitude: 36.0128, longitude: -5.6072 } },

  { id: "it-torino", name: "Turin", country: "Italie", countryCode: "IT", coordinate: { latitude: 45.0703, longitude: 7.6869 } },
  { id: "it-genova", name: "Gênes", country: "Italie", countryCode: "IT", coordinate: { latitude: 44.4056, longitude: 8.9463 } },
  { id: "it-cinque-terre", name: "Cinque Terre", country: "Italie", countryCode: "IT", coordinate: { latitude: 44.1461, longitude: 9.6438 } },
  { id: "it-firenze", name: "Florence", country: "Italie", countryCode: "IT", coordinate: { latitude: 43.7696, longitude: 11.2558 } },
  { id: "it-roma", name: "Rome", country: "Italie", countryCode: "IT", coordinate: { latitude: 41.9028, longitude: 12.4964 } },
  { id: "it-venezia", name: "Venise", country: "Italie", countryCode: "IT", coordinate: { latitude: 45.4408, longitude: 12.3155 } },

  { id: "pt-porto", name: "Porto", country: "Portugal", countryCode: "PT", coordinate: { latitude: 41.1579, longitude: -8.6291 } },
  { id: "pt-lisboa", name: "Lisbonne", country: "Portugal", countryCode: "PT", coordinate: { latitude: 38.7223, longitude: -9.1393 } },
  { id: "pt-algarve", name: "Algarve", country: "Portugal", countryCode: "PT", coordinate: { latitude: 37.0179, longitude: -7.9304 } },

  { id: "ch-geneve", name: "Genève", country: "Suisse", countryCode: "CH", coordinate: { latitude: 46.2044, longitude: 6.1432 } },
  { id: "de-schwarzwald", name: "Forêt-Noire", country: "Allemagne", countryCode: "DE", coordinate: { latitude: 48.0, longitude: 8.2 } },
];

export function searchPlaces(query: string, limit = 6): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PLACES.filter(
    (p) => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q),
  ).slice(0, limit);
}
