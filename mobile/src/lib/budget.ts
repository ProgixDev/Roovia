import type { PartyComposition } from "../store/travelerProfileStore";
import type { TripDay } from "../mocks/itineraries";

export interface BudgetBreakdown {
  fuelEur: number;
  campingEur: number;
  activitiesEur: number;
  foodEur: number;
  tollsEur: number;
  totalEur: number;
  perPersonEur: number | null;
}

/** Corridor-average pump price — a real one comes from `prix-carburants.gouv.fr` / live provider data per IMPLEMENTATION_PLAN.md §7, backend scope. */
const FUEL_PRICE_EUR_PER_L = 1.68;
const FOOD_EUR_PER_PERSON_PER_DAY = 18;
/** A flat per-km estimate standing in for real per-country toll data. */
const TOLL_EUR_PER_KM = 0.06;

export function partySizeFrom(party: PartyComposition | null, childrenCount: number): number {
  if (party === "solo") return 1;
  if (party === "couple") return 2;
  if (party === "family") return 2 + childrenCount;
  if (party === "friends") return 3;
  return 1;
}

/**
 * Deterministic, not AI — every line traces to a real input (the
 * itinerary's own stop prices, the active vehicle's real consumption, the
 * traveler profile's real party size) rather than being invented per trip.
 */
export function computeBudget(
  days: TripDay[],
  vehicle: { consumptionL100: number; fuelType: string } | null,
  totalDistanceKm: number,
  partySize: number,
): BudgetBreakdown {
  const isElectric = vehicle?.fuelType === "electric";
  const consumption = vehicle?.consumptionL100 ?? 9;
  const fuelEur = isElectric ? 0 : Math.round(totalDistanceKm * (consumption / 100) * FUEL_PRICE_EUR_PER_L);

  const stops = days.flatMap((d) => d.stops);
  const campingEur = stops.filter((s) => s.kind === "sleep_paid").reduce((sum, s) => sum + (s.priceEur ?? 0), 0);
  const activitiesEur = stops
    .filter((s) => s.kind === "activity" || s.kind === "visit")
    .reduce((sum, s) => sum + (s.priceEur ?? 0), 0);

  const foodEur = Math.round(FOOD_EUR_PER_PERSON_PER_DAY * days.length * Math.max(1, partySize));
  const tollsEur = Math.round(totalDistanceKm * TOLL_EUR_PER_KM);

  const totalEur = fuelEur + campingEur + activitiesEur + foodEur + tollsEur;
  const perPersonEur = partySize > 1 ? Math.round(totalEur / partySize) : null;

  return { fuelEur, campingEur, activitiesEur, foodEur, tollsEur, totalEur, perPersonEur };
}

/** Estimated spend for one day — its own stop prices plus that day's even share of fuel/food/tolls. */
export function perDayEstimate(day: TripDay, days: TripDay[], breakdown: BudgetBreakdown): number {
  const dayStopsEur = day.stops.reduce((sum, s) => sum + (s.priceEur ?? 0), 0);
  const sharedDaily = (breakdown.fuelEur + breakdown.foodEur + breakdown.tollsEur) / Math.max(1, days.length);
  return Math.round(dayStopsEur + sharedDaily);
}
