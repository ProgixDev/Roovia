import { computeRecapStats } from "./journalStats";

describe("computeRecapStats", () => {
  it("counts every stop", () => {
    const stats = computeRecapStats(
      [{ latitude: 48.8566, longitude: 2.3522 }, { latitude: 45.764, longitude: 4.8357 }],
      500,
      3,
    );
    expect(stats.stopCount).toBe(2);
  });

  it("rounds the total distance", () => {
    const stats = computeRecapStats([{ latitude: 48.8566, longitude: 2.3522 }], 123.7, 1);
    expect(stats.distanceKm).toBe(124);
  });

  it("counts at least one country even with no stops", () => {
    const stats = computeRecapStats([], 0, 0);
    expect(stats.countryCount).toBeGreaterThanOrEqual(1);
  });

  it("counts more than one country when stops span France and Spain", () => {
    const stats = computeRecapStats(
      [{ latitude: 48.8566, longitude: 2.3522 }, { latitude: 40.4168, longitude: -3.7038 }],
      1000,
      5,
    );
    expect(stats.countryCount).toBeGreaterThanOrEqual(2);
  });
});
