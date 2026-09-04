import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "@vehicles";

export type VehicleType = "van" | "fourgon" | "camping_car" | "heavy_truck" | "converted_car";
export type ToiletType = "cassette" | "fixed" | "none";
export type FuelType = "diesel" | "petrol" | "electric" | "hybrid";

export interface VehicleEquipment {
  shower: boolean;
  freshWaterTank: boolean;
  greyTank: boolean;
  blackTank: boolean;
  solar: boolean;
  fridge: boolean;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  /** User's own nickname — "Notre van", "Le Ducato" — shown everywhere instead of the type label alone. */
  name: string;
  heightM: number;
  lengthM: number;
  widthM: number;
  weightKg: number;
  toiletType: ToiletType;
  equipment: VehicleEquipment;
  waterCapacityL: number;
  fuelTankL: number;
  fuelType: FuelType;
  /** L/100km — 0 for fully electric, kept out of budget's fuel-cost math instead of divide-by-zero. */
  consumptionL100: number;
  hookup220V: boolean;
  /** Nights between dump-station stops the vehicle's tanks force, null = no particular constraint. */
  dumpEveryNDays: number | null;
}

const defaultEquipment: VehicleEquipment = {
  shower: false,
  freshWaterTank: true,
  greyTank: true,
  blackTank: false,
  solar: false,
  fridge: true,
};

/**
 * A poids lourd and a voiture aménagée have nothing in common dimension or
 * consumption-wise — keyed defaults so picking a type (before any custom
 * value is entered) already shows plausible numbers instead of one generic
 * van-sized default regardless of what was chosen.
 */
export const TYPE_DEFAULTS: Record<
  VehicleType,
  Pick<Vehicle, "heightM" | "lengthM" | "widthM" | "weightKg" | "fuelTankL" | "consumptionL100">
> = {
  van: { heightM: 2.0, lengthM: 4.9, widthM: 1.9, weightKg: 2200, fuelTankL: 65, consumptionL100: 7.5 },
  fourgon: { heightM: 2.7, lengthM: 5.9, widthM: 2.05, weightKg: 3500, fuelTankL: 90, consumptionL100: 9.5 },
  camping_car: { heightM: 2.9, lengthM: 6.8, widthM: 2.3, weightKg: 3500, fuelTankL: 90, consumptionL100: 11.5 },
  heavy_truck: { heightM: 3.4, lengthM: 8.5, widthM: 2.4, weightKg: 7500, fuelTankL: 150, consumptionL100: 18 },
  converted_car: { heightM: 1.55, lengthM: 4.6, widthM: 1.8, weightKg: 1600, fuelTankL: 55, consumptionL100: 6.5 },
};

export function createVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  const type = overrides.type ?? "van";
  return {
    id: `vehicle_${Date.now()}_${Math.round(Math.random() * 1000)}`,
    type,
    name: "",
    ...TYPE_DEFAULTS[type],
    toiletType: "cassette",
    equipment: { ...defaultEquipment },
    waterCapacityL: 100,
    fuelType: "diesel",
    hookup220V: true,
    dumpEveryNDays: 4,
    ...overrides,
  };
}

interface VehiclesState {
  vehicles: Vehicle[];
  activeId: string | null;
  hydrate(): Promise<void>;
  addVehicle(vehicle: Vehicle): Promise<void>;
  updateVehicle(id: string, patch: Partial<Vehicle>): Promise<void>;
  removeVehicle(id: string): Promise<void>;
  duplicateVehicle(id: string): Promise<void>;
  setActive(id: string): Promise<void>;
}

interface PersistedShape {
  vehicles: Vehicle[];
  activeId: string | null;
}

async function persist(state: PersistedShape): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort — same reasoning as every other store in this app.
  }
}

export const useVehiclesStore = create<VehiclesState>((set, get) => ({
  vehicles: [],
  activeId: null,

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<PersistedShape>;
      set({ vehicles: saved.vehicles ?? [], activeId: saved.activeId ?? null });
    } catch {
      // Storage unavailable — start fresh.
    }
  },

  async addVehicle(vehicle) {
    const vehicles = [...get().vehicles, vehicle];
    // First vehicle in the garage becomes active automatically — there is
    // no meaningful "inactive" state with exactly one vehicle.
    const activeId = get().activeId ?? vehicle.id;
    set({ vehicles, activeId });
    await persist({ vehicles, activeId });
  },

  async updateVehicle(id, patch) {
    const vehicles = get().vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v));
    set({ vehicles });
    await persist({ vehicles, activeId: get().activeId });
  },

  async removeVehicle(id) {
    const vehicles = get().vehicles.filter((v) => v.id !== id);
    const activeId = get().activeId === id ? (vehicles[0]?.id ?? null) : get().activeId;
    set({ vehicles, activeId });
    await persist({ vehicles, activeId });
  },

  async duplicateVehicle(id) {
    const source = get().vehicles.find((v) => v.id === id);
    if (!source) return;
    // Spreading `id: undefined` in would overwrite `createVehicle`'s own
    // generated id with `undefined` — object spread copies the key even
    // when its value is undefined — so it's dropped explicitly instead.
    const { id: _sourceId, ...rest } = source;
    const copy = createVehicle({ ...rest, name: `${source.name} (copie)` });
    await get().addVehicle(copy);
  },

  async setActive(id) {
    set({ activeId: id });
    await persist({ vehicles: get().vehicles, activeId: id });
  },
}));
