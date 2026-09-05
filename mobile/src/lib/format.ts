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

const METERS_PER_FOOT = 0.3048;
const KG_PER_LB = 0.453592;
const LITERS_PER_GAL = 3.78541;

/** Decimal feet/lb/gal for an editable numeric field — `formatLength`'s feet'inches" reads well but doesn't round-trip through a plain text input. */
export function metersToDisplay(meters: number, unit: UnitSystem): number {
  return unit === "imperial" ? meters / METERS_PER_FOOT : meters;
}
export function displayToMeters(value: number, unit: UnitSystem): number {
  return unit === "imperial" ? value * METERS_PER_FOOT : value;
}
export function kgToDisplay(kg: number, unit: UnitSystem): number {
  return unit === "imperial" ? kg / KG_PER_LB : kg;
}
export function displayToKg(value: number, unit: UnitSystem): number {
  return unit === "imperial" ? value * KG_PER_LB : value;
}
export function litersToDisplay(liters: number, unit: UnitSystem): number {
  return unit === "imperial" ? liters / LITERS_PER_GAL : liters;
}
export function displayToLiters(value: number, unit: UnitSystem): number {
  return unit === "imperial" ? value * LITERS_PER_GAL : value;
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

/** Reciprocal, not proportional, unlike every other pair above — L/100km and MPG both describe the same trip from opposite ends, so converting is inverting, not scaling. */
export function consumptionToDisplay(litersPer100km: number, unit: UnitSystem): number {
  return unit === "imperial" ? 235.215 / litersPer100km : litersPer100km;
}
export function displayToConsumption(value: number, unit: UnitSystem): number {
  return unit === "imperial" ? 235.215 / value : value;
}

// Static — a real rate feed is backend scope (see IMPLEMENTATION_PLAN.md
// §7's "cached rates"). Every stored price in this app is EUR; this is the
// one place that fact matters.
const EUR_EXCHANGE_RATES: Record<string, number> = { EUR: 1, USD: 1.08, GBP: 0.86, CHF: 0.95 };

export function convertFromEur(amountEur: number, currency: string): number {
  return amountEur * (EUR_EXCHANGE_RATES[currency] ?? 1);
}

export function formatCurrency(amount: number, currency = "EUR", locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

/** Converts a EUR amount to `currency` and formats it in one step — what every budget/expense display actually wants. */
export function formatEurAs(amountEur: number, currency: string, locale = "fr-FR"): string {
  return formatCurrency(convertFromEur(amountEur, currency), currency, locale);
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
