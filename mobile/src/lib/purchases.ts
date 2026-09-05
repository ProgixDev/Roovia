export type PlanId = "free" | "monthly" | "annual" | "trip_pass";

export interface Entitlement {
  plan: PlanId;
  active: boolean;
  expiresAt: string | null;
  inGracePeriod: boolean;
}

export interface PurchaseResult {
  success: boolean;
  entitlement: Entitlement;
}

/**
 * The seam a real RevenueCat adapter drops into later without touching a
 * screen — every caller in this app goes through this interface, never a
 * concrete provider, so swapping `MockPurchasesProvider` for a real
 * `react-native-purchases`-backed one is a one-file change.
 */
export interface PurchasesProvider {
  purchase(plan: PlanId): Promise<PurchaseResult>;
  restore(): Promise<Entitlement>;
  getEntitlement(): Entitlement;
}

const FREE_ENTITLEMENT: Entitlement = { plan: "free", active: false, expiresAt: null, inGracePeriod: false };

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * No real StoreKit/Play Billing call — see IMPLEMENTATION_PLAN.md §15.
 * Every state a real IAP flow can end up in (active, expired, grace
 * period) is reachable here too, so the paywall UI has somewhere real to
 * point its restore/expiry logic at.
 */
export class MockPurchasesProvider implements PurchasesProvider {
  private entitlement: Entitlement = FREE_ENTITLEMENT;

  async purchase(plan: PlanId): Promise<PurchaseResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (plan === "free") {
      this.entitlement = FREE_ENTITLEMENT;
    } else if (plan === "trip_pass") {
      this.entitlement = { plan, active: true, expiresAt: addDays(30), inGracePeriod: false };
    } else {
      this.entitlement = { plan, active: true, expiresAt: addDays(plan === "annual" ? 365 : 30), inGracePeriod: false };
    }
    return { success: true, entitlement: this.entitlement };
  }

  async restore(): Promise<Entitlement> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return this.entitlement;
  }

  getEntitlement(): Entitlement {
    return this.entitlement;
  }

  /** Demo-only: pushes the current entitlement into grace period or expiry so both states are showable without waiting a real billing cycle. */
  simulate(state: "grace_period" | "expired"): void {
    if (this.entitlement.plan === "free") return;
    if (state === "grace_period") {
      this.entitlement = { ...this.entitlement, inGracePeriod: true };
    } else {
      this.entitlement = { ...FREE_ENTITLEMENT };
    }
  }
}

export const purchasesProvider = new MockPurchasesProvider();
