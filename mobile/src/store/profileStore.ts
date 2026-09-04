import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

// App-agnostic key, matching onboardingStore's `@onboarding_seen` /
// ThemeContext's `@theme_mode` naming — see onboardingStore.ts for why.
const STORAGE_KEY = "@profile_setup";

export type PartyComposition = "solo" | "couple" | "family" | "friends";
export type VehicleType = "van" | "fourgon" | "camping_car" | "heavy_truck" | "converted_car";
export type SetupStatus = "not_started" | "in_progress" | "completed" | "skipped";
export type SetupStep = 0 | 1 | 2;

export interface TravelerDraft {
  party: PartyComposition | null;
  destination: string;
  datesFixed: boolean;
  startDate: string;
  endDate: string;
}

export interface VehicleDraft {
  type: VehicleType | null;
  heightM: string;
  lengthM: string;
  widthM: string;
}

const defaultTraveler: TravelerDraft = {
  party: null,
  destination: "",
  datesFixed: false,
  startDate: "",
  endDate: "",
};

const defaultVehicle: VehicleDraft = {
  type: null,
  heightM: "",
  lengthM: "",
  widthM: "",
};

interface PersistedShape {
  status: SetupStatus;
  step: SetupStep;
  traveler: TravelerDraft;
  vehicle: VehicleDraft;
  tripIdea: string;
}

interface ProfileState extends PersistedShape {
  hydrate(): Promise<void>;
  /** Committed once per step (on "Next"), not per keystroke — each screen
   * holds its own fields in local state while editing, same as the auth
   * forms, and lifts them here only on submit. */
  updateTraveler(patch: Partial<TravelerDraft>): Promise<void>;
  updateVehicle(patch: Partial<VehicleDraft>): Promise<void>;
  advanceTo(step: SetupStep): Promise<void>;
  complete(tripIdea: string): Promise<void>;
  /** Keeps whatever was already filled in — only the status changes, so a
   * later "complete your profile" prompt (not built yet) has something to
   * resume rather than starting over. */
  skip(): Promise<void>;
}

async function persist(state: PersistedShape): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort, same as onboardingStore — the in-memory state is already
    // correct for this session even if the write fails.
  }
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  status: "not_started",
  step: 0,
  traveler: defaultTraveler,
  vehicle: defaultVehicle,
  tripIdea: "",

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<PersistedShape>;
      set({
        status: saved.status ?? "not_started",
        step: saved.step ?? 0,
        traveler: { ...defaultTraveler, ...saved.traveler },
        vehicle: { ...defaultVehicle, ...saved.vehicle },
        tripIdea: saved.tripIdea ?? "",
      });
    } catch {
      // Storage unavailable — start fresh, same reasoning as onboardingStore.
    }
  },

  async updateTraveler(patch) {
    const traveler = { ...get().traveler, ...patch };
    set({ traveler });
    await persist({ ...get(), traveler });
  },

  async updateVehicle(patch) {
    const vehicle = { ...get().vehicle, ...patch };
    set({ vehicle });
    await persist({ ...get(), vehicle });
  },

  async advanceTo(step) {
    set({ step, status: "in_progress" });
    await persist({ ...get(), step, status: "in_progress" });
  },

  async complete(tripIdea) {
    set({ tripIdea, status: "completed" });
    await persist({ ...get(), tripIdea, status: "completed" });
  },

  async skip() {
    set({ status: "skipped" });
    await persist({ ...get(), status: "skipped" });
  },
}));
