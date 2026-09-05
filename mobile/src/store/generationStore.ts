import { create } from "zustand";

import { applyRefinement, pickBaseItinerary, type GeneratedItinerary, type RefinementKind } from "../mocks/itineraries";
import { useItineraryStore } from "./itineraryStore";
import { useTripsStore } from "./tripsStore";

export type GenerationStatus = "idle" | "pending" | "done" | "failed";

export const GENERATION_STEPS = [
  { label: "Analyse de votre profil", durationMs: 600 },
  { label: "Recherche d'itinéraires", durationMs: 1800 },
  { label: "Sélection des spots", durationMs: 2200 },
  { label: "Calcul du budget", durationMs: 1200 },
  { label: "Finalisation", durationMs: 800 },
] as const;

interface GenerationState {
  status: GenerationStatus;
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
  stepIndex: 0,
  resultTripId: null,
  forceFail: false,
  runId: 0,

  async start(prompt, destination, nights, budgetEur) {
    const runId = get().runId + 1;
    set({ runId, status: "pending", stepIndex: 0, resultTripId: null });

    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      if (get().runId !== runId) return; // cancelled mid-sequence
      set({ stepIndex: i });
      await wait(GENERATION_STEPS[i].durationMs);
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
