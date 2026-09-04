import { fitIssues, fits } from "./vehicleFit";

const van = { heightM: 2.7, weightKg: 3500, lengthM: 5.9 };

describe("vehicleFit", () => {
  it("fits when no constraint is exceeded", () => {
    expect(fits(van, { maxHeightM: 3.0 })).toBe(true);
  });

  it("fits when the constraint has no limits at all", () => {
    expect(fits(van, {})).toBe(true);
  });

  it("fails on height alone", () => {
    expect(fits(van, { maxHeightM: 2.5 })).toBe(false);
  });

  it("reports every exceeded dimension, not just the first", () => {
    const issues = fitIssues(van, { maxHeightM: 2.5, maxWeightKg: 3000, maxLengthM: 5.5 });
    expect(issues).toHaveLength(3);
  });

  it("does not flag a dimension exactly at the limit", () => {
    expect(fits(van, { maxHeightM: 2.7, maxWeightKg: 3500, maxLengthM: 5.9 })).toBe(true);
  });

  it("names the exceeded dimension in plain language", () => {
    const issues = fitIssues(van, { maxHeightM: 2.5 });
    expect(issues[0]).toContain("Hauteur");
    expect(issues[0]).toContain("2.70 m");
    expect(issues[0]).toContain("2.50 m");
  });
});
