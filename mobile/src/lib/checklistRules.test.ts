import { generateChecklist } from "./checklistRules";
import { createVehicle } from "../store/vehiclesStore";

describe("generateChecklist", () => {
  it("always includes the base documents", () => {
    const items = generateChecklist({ destination: "France", nights: 3, party: "solo", hasChildren: false, vehicle: null });
    expect(items.some((i) => i.id === "passport")).toBe(true);
    expect(items.some((i) => i.id === "insurance")).toBe(true);
  });

  it("adds border-crossing items only for an international destination", () => {
    const domestic = generateChecklist({ destination: "France", nights: 3, party: "solo", hasChildren: false, vehicle: null });
    const international = generateChecklist({ destination: "Espagne", nights: 3, party: "solo", hasChildren: false, vehicle: null });
    expect(domestic.some((i) => i.id === "vignette")).toBe(false);
    expect(international.some((i) => i.id === "vignette")).toBe(true);
  });

  it("adds child-specific items only when traveling with children", () => {
    const withChildren = generateChecklist({ destination: "France", nights: 3, party: "family", hasChildren: true, vehicle: null });
    const withoutChildren = generateChecklist({ destination: "France", nights: 3, party: "solo", hasChildren: false, vehicle: null });
    expect(withChildren.some((i) => i.id === "car-seat")).toBe(true);
    expect(withoutChildren.some((i) => i.id === "car-seat")).toBe(false);
  });

  it("adds a solar-check item only when the vehicle has solar equipment", () => {
    const withSolar = createVehicle({ equipment: { shower: false, freshWaterTank: true, greyTank: true, blackTank: false, solar: true, fridge: true } });
    const withoutSolar = createVehicle({ equipment: { shower: false, freshWaterTank: true, greyTank: true, blackTank: false, solar: false, fridge: true } });
    const items1 = generateChecklist({ destination: "France", nights: 3, party: "solo", hasChildren: false, vehicle: withSolar });
    const items2 = generateChecklist({ destination: "France", nights: 3, party: "solo", hasChildren: false, vehicle: withoutSolar });
    expect(items1.some((i) => i.id === "solar-check")).toBe(true);
    expect(items2.some((i) => i.id === "solar-check")).toBe(false);
  });

  it("adds a gas check only for a longer trip", () => {
    const short = generateChecklist({ destination: "France", nights: 2, party: "solo", hasChildren: false, vehicle: null });
    const long = generateChecklist({ destination: "France", nights: 10, party: "solo", hasChildren: false, vehicle: null });
    expect(short.some((i) => i.id === "gas")).toBe(false);
    expect(long.some((i) => i.id === "gas")).toBe(true);
  });
});
