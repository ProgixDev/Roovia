export interface DayForecast {
  dayIndex: number;
  condition: "sunny" | "cloudy" | "rain" | "storm";
  tempC: number;
}

/**
 * Seeded specifically so day 2 always rains — every base itinerary (see
 * `itineraries.ts`) gets a weather-triggered re-route suggestion out of the
 * box, rather than leaving it to chance which trip happens to demo the
 * feature.
 */
export function forecastFor(dayIndex: number): DayForecast {
  if (dayIndex === 2) return { dayIndex, condition: "rain", tempC: 14 };
  if (dayIndex === 4) return { dayIndex, condition: "storm", tempC: 12 };
  return { dayIndex, condition: dayIndex % 3 === 0 ? "cloudy" : "sunny", tempC: 21 };
}
