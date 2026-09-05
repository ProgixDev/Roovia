import { create } from "zustand";

import { applyRefinement, pickBaseItinerary, type GeneratedItinerary, type RefinementKind } from "../mocks/itineraries";
import { useItineraryStore } from "./itineraryStore";
import { useTripsStore } from "./tripsStore";

export type GenerationStatus = "idle" | "pending" | "done" | "failed";

export interface GenerationStep {
  label: string;
  /** Narrates what this step would actually be doing against the real request — the seam a real pipeline's own progress events drop into. */
  detail: string;
  durationMs: number;
}

const GENERIC_STEPS: GenerationStep[] = [
  { label: "Analyse de votre profil", detail: "Lecture du profil voyageur, du véhicule actif et des préférences enregistrées.", durationMs: 500 },
  { label: "Compréhension de la demande", detail: "Interprétation de vos critères de durée, de budget et de destination.", durationMs: 700 },
  { label: "Recherche d'itinéraires", detail: "Exploration des routes et des spots disponibles.", durationMs: 1600 },
  { label: "Sélection des spots", detail: "Sélection des étapes jour par jour.", durationMs: 1800 },
  { label: "Vérification véhicule", detail: "Contrôle des restrictions de gabarit, poids et accès.", durationMs: 900 },
  { label: "Calcul du budget", detail: "Estimation du budget prévisionnel par poste de dépense.", durationMs: 1100 },
  { label: "Finalisation", detail: "Mise en forme de l'itinéraire complet.", durationMs: 700 },
];

/**
 * Personalizes each step's narration with the actual request — no real
 * model runs here, but the copy reads like live progress from one, so
 * swapping this for a real pipeline's streamed step events later only
 * touches this function, not `RunningScreen`.
 */
function buildSteps(prompt: string, destination: string, nights: number, budgetEur: number): GenerationStep[] {
  const dest = destination.trim() || "votre destination";
  const nightsLabel = nights > 0 ? `${nights} nuit${nights > 1 ? "s" : ""}` : "la durée indiquée";
  const budgetLabel = budgetEur > 0 ? `${budgetEur} €` : "votre budget";

  return [
    GENERIC_STEPS[0],
    {
      ...GENERIC_STEPS[1],
      detail: prompt.trim()
        ? `Interprétation de « ${prompt.trim()} ».`
        : GENERIC_STEPS[1].detail,
    },
    { ...GENERIC_STEPS[2], detail: `Exploration des routes et des spots autour de ${dest}.` },
    { ...GENERIC_STEPS[3], detail: `Construction de l'itinéraire pour ${nightsLabel}.` },
    GENERIC_STEPS[4],
    { ...GENERIC_STEPS[5], detail: `Ajustement de l'itinéraire à ${budgetLabel}.` },
    GENERIC_STEPS[6],
  ];
}

interface GenerationState {
  status: GenerationStatus;
  steps: GenerationStep[];
  stepIndex: number;
  resultTripId: string | null;
  /** Dev affordance (long-press the running screen's header) so the retry path has something to demo. */
  forceFail: boolean;
  runId: number;
  start(prompt: string, destination: string, nights: number, budgetEur: number): Promise<void>;
  cancel(): void;
  reset(): void;
  toggleForceFail(): void;
  refine(tripId: string, kind: RefinementKind, label: string): Promise<void>;
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  status: "idle",
  steps: GENERIC_STEPS,
  stepIndex: 0,
  resultTripId: null,
  forceFail: false,
  runId: 0,

  async start(prompt, destination, nights, budgetEur) {
    const runId = get().runId + 1;
    const steps = buildSteps(prompt, destination, nights, budgetEur);
    set({ runId, status: "pending", stepIndex: 0, resultTripId: null, steps });

    for (let i = 0; i < steps.length; i++) {
      if (get().runId !== runId) return; // cancelled mid-sequence
      set({ stepIndex: i });
      await wait(steps[i].durationMs);
    }
    if (get().runId !== runId) return;

    if (get().forceFail) {
      set({ status: "failed" });
      return;
    }

    const base = pickBaseItinerary(`${prompt} ${destination}`);
    const result: GeneratedItinerary = {
      ...base,
      title: destination ? `${base.title.split(" (")[0]} — ${destination}` : base.title,
    };

    const tripId = useTripsStore.getState().addGenerated({
      title: result.title,
      destination: result.destination,
      dateRange: `${nights} nuits`,
      distanceKm: result.totalDistanceKm,
      budgetEur: budgetEur || result.totalBudgetEur,
    });
    useItineraryStore.getState().createFromResult(tripId, result);

    set({ status: "done", resultTripId: tripId });
  },

  cancel() {
    set({ runId: get().runId + 1, status: "idle", stepIndex: 0 });
  },

  reset() {
    set({ status: "idle", stepIndex: 0, resultTripId: null });
  },

  toggleForceFail() {
    set({ forceFail: !get().forceFail });
  },

  async refine(tripId, kind, label) {
    const itinerary = useItineraryStore.getState().itineraries[tripId];
    if (!itinerary) return;
    const activeVersion = itinerary.versions.find((v) => v.id === itinerary.activeVersionId);
    if (!activeVersion) return;

    const asBase: GeneratedItinerary = {
      title: activeVersion.label,
      destination: itinerary.destination,
      days: activeVersion.days,
      totalDistanceKm: activeVersion.totalDistanceKm,
      totalBudgetEur: activeVersion.totalBudgetEur,
    };
    // Locked stops and manual edits on the active version survive: locks
    // are threaded into the transform itself (see `applyRefinement`)
    // rather than reconciled afterward by position.
    const refined = applyRefinement(asBase, kind, new Set(itinerary.lockedStopIds));

    useItineraryStore.getState().addVersion(tripId, refined, label);
  },
}));
