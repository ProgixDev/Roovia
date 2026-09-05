import { create } from "zustand";

import { purchasesProvider, type Entitlement, type PlanId } from "../lib/purchases";

const FREE_MONTHLY_GENERATIONS = 2;
/** Premium-only map layers — todo.md's "locked layers" for the free tier. */
export const PREMIUM_POI_KINDS = ["viewpoint", "market"] as const;

interface EntitlementsState {
  entitlement: Entitlement;
  generationsUsedThisMonth: number;
  /** The upsell shown once after a trip's first generation — this flag, not per-trip state, is what keeps it from reappearing every time. */
  hasSeenPostGenerationUpsell: boolean;
  purchase(plan: PlanId): Promise<void>;
  restore(): Promise<void>;
  simulateGracePeriod(): void;
  simulateExpired(): void;
  recordGeneration(): void;
  canGenerate(): boolean;
  generationsRemaining(): number;
  markPostGenerationUpsellSeen(): void;
}

export const useEntitlementsStore = create<EntitlementsState>((set, get) => ({
  entitlement: purchasesProvider.getEntitlement(),
  generationsUsedThisMonth: 0,
  hasSeenPostGenerationUpsell: false,

  async purchase(plan) {
    const result = await purchasesProvider.purchase(plan);
    set({ entitlement: result.entitlement });
  },

  async restore() {
    const entitlement = await purchasesProvider.restore();
    set({ entitlement });
  },

  simulateGracePeriod() {
    purchasesProvider.simulate("grace_period");
    set({ entitlement: purchasesProvider.getEntitlement() });
  },

  simulateExpired() {
    purchasesProvider.simulate("expired");
    set({ entitlement: purchasesProvider.getEntitlement() });
  },

  recordGeneration() {
    set({ generationsUsedThisMonth: get().generationsUsedThisMonth + 1 });
  },

  canGenerate() {
    if (get().entitlement.active) return true;
    return get().generationsUsedThisMonth < FREE_MONTHLY_GENERATIONS;
  },

  generationsRemaining() {
    if (get().entitlement.active) return Infinity;
    return Math.max(0, FREE_MONTHLY_GENERATIONS - get().generationsUsedThisMonth);
  },

  markPostGenerationUpsellSeen() {
    set({ hasSeenPostGenerationUpsell: true });
  },
}));
