import { PLACES } from "../mocks/places";
import { distanceKm } from "../mocks/pois";
import type { LatLng } from "../features/map/types";

export interface RecapStats {
  distanceKm: number;
  stopCount: number;
  countryCount: number;
  dayCount: number;
}

/** Nearest known place's country — an approximation real reverse-geocoding would replace, good enough for a recap stat over a handful of stops. */
function nearestCountryCode(coordinate: LatLng): string {
  let best = PLACES[0];
  let bestDistance = distanceKm(coordinate, best.coordinate);
  for (const place of PLACES) {
    const d = distanceKm(coordinate, place.coordinate);
    if (d < bestDistance) {
      best = place;
      bestDistance = d;
    }
  }
  return best.countryCode;
}

export function computeRecapStats(stopCoordinates: LatLng[], totalDistanceKm: number, dayCount: number): RecapStats {
  const countries = new Set(stopCoordinates.map(nearestCountryCode));
  return {
    distanceKm: Math.round(totalDistanceKm),
    stopCount: stopCoordinates.length,
    countryCount: Math.max(1, countries.size),
    dayCount,
  };
}
