import { computeBudget, partySizeFrom, perDayEstimate } from "./budget";
import type { TripDay } from "../mocks/itineraries";

const days: TripDay[] = [
  {
    id: "d1",
    index: 1,
    stops: [
      { id: "s1", name: "Visite", kind: "visit", description: "", coordinate: { latitude: 0, longitude: 0 }, driveTimeMinFromPrev: null, priceEur: 10 },
      { id: "s2", name: "Camping", kind: "sleep_paid", description: "", coordinate: { latitude: 0, longitude: 0 }, driveTimeMinFromPrev: null, priceEur: 20 },
    ],
  },
  {
    id: "d2",
    index: 2,
    stops: [
      { id: "s3", name: "Bivouac", kind: "sleep_free", description: "", coordinate: { latitude: 0, longitude: 0 }, driveTimeMinFromPrev: null, priceEur: null },
    ],
  },
];

describe("partySizeFrom", () => {
  it("counts solo as 1", () => expect(partySizeFrom("solo", 0)).toBe(1));
  it("counts couple as 2", () => expect(partySizeFrom("couple", 0)).toBe(2));
  it("counts family as 2 plus children", () => expect(partySizeFrom("family", 3)).toBe(5));
  it("defaults friends to 3", () => expect(partySizeFrom("friends", 0)).toBe(3));
  it("falls back to 1 with no party set", () => expect(partySizeFrom(null, 0)).toBe(1));
});

describe("computeBudget", () => {
  it("sums stop prices into their own categories", () => {
    const b = computeBudget(days, { consumptionL100: 10, fuelType: "diesel" }, 100, 1);
    expect(b.activitiesEur).toBe(10);
    expect(b.campingEur).toBe(20);
  });

  it("zeroes fuel cost for an electric vehicle", () => {
    const b = computeBudget(days, { consumptionL100: 0, fuelType: "electric" }, 500, 1);
    expect(b.fuelEur).toBe(0);
  });

  it("scales fuel cost with distance and consumption", () => {
    const short = computeBudget(days, { consumptionL100: 10, fuelType: "diesel" }, 100, 1);
    const long = computeBudget(days, { consumptionL100: 10, fuelType: "diesel" }, 1000, 1);
    expect(long.fuelEur).toBeGreaterThan(short.fuelEur);
  });

  it("has no per-person split for a single traveler", () => {
    const b = computeBudget(days, { consumptionL100: 10, fuelType: "diesel" }, 100, 1);
    expect(b.perPersonEur).toBeNull();
  });

  it("splits the total evenly across a group", () => {
    const b = computeBudget(days, { consumptionL100: 10, fuelType: "diesel" }, 100, 4);
    expect(b.perPersonEur).toBe(Math.round(b.totalEur / 4));
  });
});

describe("perDayEstimate", () => {
  it("gives a day with a paid stop a higher estimate than one without", () => {
    const breakdown = computeBudget(days, { consumptionL100: 10, fuelType: "diesel" }, 100, 1);
    const day1 = perDayEstimate(days[0], days, breakdown);
    const day2 = perDayEstimate(days[1], days, breakdown);
    expect(day1).toBeGreaterThan(day2);
  });
});
