import { computeBalances, minimalSettlement, type Expense } from "./settle";

const participants = ["alice", "bob", "carol"];

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: "e1",
    amountEur: 90,
    payerId: "alice",
    category: "nourriture",
    splitType: "equal",
    participantIds: participants,
    date: "2026-09-01",
    hasReceipt: false,
    synced: true,
    ...overrides,
  };
}

describe("computeBalances", () => {
  it("splits an equal expense three ways, crediting the payer", () => {
    const balances = computeBalances([expense({})], participants);
    const byId = Object.fromEntries(balances.map((b) => [b.participantId, b.amountEur]));
    expect(byId.alice).toBe(60);
    expect(byId.bob).toBe(-30);
    expect(byId.carol).toBe(-30);
  });

  it("nets to zero across all participants", () => {
    const balances = computeBalances([expense({}), expense({ id: "e2", payerId: "bob", amountEur: 60 })], participants);
    const total = balances.reduce((sum, b) => sum + b.amountEur, 0);
    expect(Math.round(total * 100) / 100).toBe(0);
  });

  it("respects an exact split", () => {
    const balances = computeBalances(
      [expense({ splitType: "exact", splits: [{ participantId: "bob", shareOrAmount: 20 }, { participantId: "carol", shareOrAmount: 70 }] })],
      participants,
    );
    const byId = Object.fromEntries(balances.map((b) => [b.participantId, b.amountEur]));
    expect(byId.bob).toBe(-20);
    expect(byId.carol).toBe(-70);
  });

  it("weights a shares split proportionally", () => {
    const balances = computeBalances(
      [expense({ amountEur: 90, splitType: "shares", splits: [{ participantId: "bob", shareOrAmount: 1 }, { participantId: "carol", shareOrAmount: 2 }] })],
      participants,
    );
    const byId = Object.fromEntries(balances.map((b) => [b.participantId, b.amountEur]));
    expect(byId.bob).toBe(-30);
    expect(byId.carol).toBe(-60);
  });
});

describe("minimalSettlement", () => {
  it("needs no transactions when everyone is already even", () => {
    expect(minimalSettlement([{ participantId: "alice", amountEur: 0 }])).toHaveLength(0);
  });

  it("settles a simple two-person debt in one transaction", () => {
    const settlements = minimalSettlement([
      { participantId: "alice", amountEur: 30 },
      { participantId: "bob", amountEur: -30 },
    ]);
    expect(settlements).toEqual([{ from: "bob", to: "alice", amountEur: 30 }]);
  });

  it("uses at most n-1 transactions for n participants", () => {
    const settlements = minimalSettlement([
      { participantId: "alice", amountEur: 60 },
      { participantId: "bob", amountEur: -30 },
      { participantId: "carol", amountEur: -30 },
    ]);
    expect(settlements.length).toBeLessThanOrEqual(2);
  });
});
