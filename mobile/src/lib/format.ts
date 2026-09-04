/**
 * Every stored measurement is SI (meters, kilograms, liters, km) — these
 * convert only at the display boundary, so a store never has to know which
 * unit system is active. Screens read the preference from `settingsStore`
 * and pass it in; these stay pure so they're trivial to test.
 */
export type UnitSystem = "metric" | "imperial";

export function formatDistance(km: number, unit: UnitSystem = "metric"): string {
  if (unit === "imperial") return `${Math.round(km * 0.621371)} mi`;
  return `${Math.round(km)} km`;
}

/** Height, length, or width — feet'inches" is how a US clearance sign actually reads, not decimal feet. */
export function formatLength(meters: number, unit: UnitSystem = "metric"): string {
  if (unit === "metric") return `${meters.toFixed(2)} m`;
  const totalInches = meters * 39.3701;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export function formatWeight(kg: number, unit: UnitSystem = "metric"): string {
  if (unit === "imperial") return `${Math.round(kg * 2.20462)} lb`;
  return `${Math.round(kg)} kg`;
}

export function formatVolume(liters: number, unit: UnitSystem = "metric"): string {
  if (unit === "imperial") return `${Math.round(liters * 0.264172)} gal`;
  return `${Math.round(liters)} L`;
}

/** Fuel consumption — L/100km converts to US MPG, the unit the imperial figure is actually read in. */
export function formatConsumption(litersPer100km: number, unit: UnitSystem = "metric"): string {
  if (unit === "imperial") return `${Math.round(235.215 / litersPer100km)} mpg`;
  return `${litersPer100km.toFixed(1)} L/100km`;
}

export function formatCurrency(amount: number, currency = "EUR", locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: Date, locale = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function formatDateRange(start: Date, end: Date, locale = "fr-FR"): string {
  const day = new Intl.DateTimeFormat(locale, { day: "numeric" });
  const full = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth ? `${day.format(start)} – ${full.format(end)}` : `${full.format(start)} – ${full.format(end)}`;
}
