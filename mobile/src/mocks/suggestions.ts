import type { TripDay } from "./itineraries";
import { forecastFor } from "./weather";

export type SuggestionTrigger = "weather" | "closed" | "delay" | "plan_change" | "group_proposal";

export interface SuggestionDiff {
  deltaKm: number;
  deltaEur: number;
  deltaMinutes: number;
  addedStopNames: string[];
  removedStopNames: string[];
}

export interface Suggestion {
  id: string;
  trigger: SuggestionTrigger;
  title: string;
  body: string;
  dayId: string;
  stopId: string | null;
  diff: SuggestionDiff;
}

/**
 * Deterministic from the itinerary's own shape — every trigger kind todo.md
 * lists shows up at least once for any generated trip, rather than leaving
 * "group proposal" or "running late" to chance.
 */
export function generateSuggestions(days: TripDay[]): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const day of days) {
    const forecast = forecastFor(day.index);
    if (forecast.condition === "rain" || forecast.condition === "storm") {
      const outdoor = day.stops.find((s) => s.kind === "activity" || s.kind === "sleep_free");
      if (outdoor) {
        suggestions.push({
          id: `sugg_weather_${day.id}`,
          trigger: "weather",
          title: `${forecast.condition === "storm" ? "Orage" : "Pluie"} prévu le jour ${day.index}`,
          body: `${outdoor.name} sera difficile par ce temps. Le remplacer par une étape couverte à proximité ?`,
          dayId: day.id,
          stopId: outdoor.id,
          diff: { deltaKm: -8, deltaEur: 6, deltaMinutes: -10, addedStopNames: ["Halle couverte à proximité"], removedStopNames: [outdoor.name] },
        });
      }
    }
  }

  const firstVisitDay = days.find((d) => d.stops.some((s) => s.kind === "visit"));
  const firstVisit = firstVisitDay?.stops.find((s) => s.kind === "visit");
  if (firstVisit && firstVisitDay) {
    suggestions.push({
      id: `sugg_closed_${firstVisitDay.id}`,
      trigger: "closed",
      title: `${firstVisit.name} fermé exceptionnellement`,
      body: "Fermeture signalée par la communauté à la date prévue. Un remplacement à proximité est proposé.",
      dayId: firstVisitDay.id,
      stopId: firstVisit.id,
      diff: { deltaKm: 4, deltaEur: 0, deltaMinutes: 12, addedStopNames: ["Alternative à proximité"], removedStopNames: [firstVisit.name] },
    });
  }

  if (days.length >= 2) {
    const day = days[1];
    suggestions.push({
      id: `sugg_delay_${day.id}`,
      trigger: "delay",
      title: "Retard sur le planning",
      body: "Le rythme actuel prend du retard sur les jours restants. Alléger le jour 2 pour rattraper ?",
      dayId: day.id,
      stopId: null,
      diff: { deltaKm: -20, deltaEur: 0, deltaMinutes: -35, addedStopNames: [], removedStopNames: [] },
    });

    suggestions.push({
      id: `sugg_group_${day.id}`,
      trigger: "group_proposal",
      title: "Un membre du groupe propose un arrêt",
      body: "Marie a suggéré une aire de baignade à 15 minutes de votre trajet du jour 2.",
      dayId: day.id,
      stopId: null,
      diff: { deltaKm: 15, deltaEur: 0, deltaMinutes: 20, addedStopNames: ["Aire de baignade (proposée par Marie)"], removedStopNames: [] },
    });
  }

  return suggestions;
}

/** The manual "recalculer depuis ici" affordance — one ad-hoc suggestion for a specific day, not a fresh batch. */
export function manualRecalculateSuggestion(dayId: string, dayIndex: number): Suggestion {
  return {
    id: `sugg_manual_${dayId}_${Date.now()}`,
    trigger: "plan_change",
    title: `Recalcul manuel — jour ${dayIndex}`,
    body: "Nouvelle proposition pour la suite de cette journée, en tenant compte de vos étapes verrouillées.",
    dayId,
    stopId: null,
    diff: { deltaKm: -6, deltaEur: -4, deltaMinutes: -10, addedStopNames: ["Étape alternative"], removedStopNames: [] },
  };
}
