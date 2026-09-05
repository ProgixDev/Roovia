export type SplitType = "equal" | "shares" | "exact";

export interface ExpenseSplit {
  participantId: string;
  /** Relative weight for "shares", a literal EUR amount for "exact". Unused for "equal". */
  shareOrAmount: number;
}

export interface Expense {
  id: string;
  amountEur: number;
  payerId: string;
  category: "carburant" | "hebergement" | "nourriture" | "activites" | "autre";
  splitType: SplitType;
  participantIds: string[];
  splits?: ExpenseSplit[];
  date: string;
  hasReceipt: boolean;
  /** Added while offline — flips true once the (simulated) reconnect sync runs. */
  synced: boolean;
}

export interface Balance {
  participantId: string;
  /** Positive = owed to them, negative = they owe. */
  amountEur: number;
}

export interface Settlement {
  from: string;
  to: string;
  amountEur: number;
}

function sharesFor(expense: Expense): Map<string, number> {
  const shares = new Map<string, number>();

  if (expense.splitType === "equal") {
    const each = expense.amountEur / Math.max(1, expense.participantIds.length);
    for (const id of expense.participantIds) shares.set(id, each);
    return shares;
  }

  const splits = expense.splits ?? [];
  if (expense.splitType === "exact") {
    for (const s of splits) shares.set(s.participantId, s.shareOrAmount);
    return shares;
  }

  // shares
  const totalWeight = splits.reduce((sum, s) => sum + s.shareOrAmount, 0) || 1;
  for (const s of splits) shares.set(s.participantId, (s.shareOrAmount / totalWeight) * expense.amountEur);
  return shares;
}

/** Everyone's net position across every expense — the payer is credited in full, every participant (including the payer, if listed) is debited their share. */
export function computeBalances(expenses: Expense[], participantIds: string[]): Balance[] {
  const totals = new Map(participantIds.map((id) => [id, 0]));

  for (const expense of expenses) {
    totals.set(expense.payerId, (totals.get(expense.payerId) ?? 0) + expense.amountEur);
    for (const [participantId, amount] of sharesFor(expense)) {
      totals.set(participantId, (totals.get(participantId) ?? 0) - amount);
    }
  }

  return Array.from(totals, ([participantId, amountEur]) => ({ participantId, amountEur: Math.round(amountEur * 100) / 100 }));
}

/**
 * Greedy creditor/debtor matching — not the fewest-transactions-possible
 * optimum in every case, but the standard, easy-to-follow approach real
 * Tricount-style apps use, and it never needs more than n-1 transactions
 * for n participants.
 */
export function minimalSettlement(balances: Balance[]): Settlement[] {
  const creditors = balances.filter((b) => b.amountEur > 0.01).map((b) => ({ ...b })).sort((a, b) => b.amountEur - a.amountEur);
  const debtors = balances.filter((b) => b.amountEur < -0.01).map((b) => ({ participantId: b.participantId, amountEur: -b.amountEur })).sort((a, b) => b.amountEur - a.amountEur);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.round(Math.min(creditors[i].amountEur, debtors[j].amountEur) * 100) / 100;
    if (amount > 0) {
      settlements.push({ from: debtors[j].participantId, to: creditors[i].participantId, amountEur: amount });
    }
    creditors[i].amountEur -= amount;
    debtors[j].amountEur -= amount;
    if (creditors[i].amountEur < 0.01) i++;
    if (debtors[j].amountEur < 0.01) j++;
  }
  return settlements;
}
