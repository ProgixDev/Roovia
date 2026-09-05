import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { useProfileStore } from "./profileStore";

const STORAGE_KEY = "@traveler_profile";

export type PartyComposition = "solo" | "couple" | "family" | "friends";
export type Interest = "beach" | "hiking" | "sport" | "museums" | "food" | "nature";

export interface ChildProfile {
  id: string;
  age: number;
}

export interface DatedConstraint {
  id: string;
  label: string;
  date: string;
}

export interface TravelerProfile {
  party: PartyComposition | null;
  children: ChildProfile[];
  interests: Interest[];
  budgetEur: number;
  nights: number;
  destination: string;
  datesFixed: boolean;
  startDate: string;
  endDate: string;
  flexibleMonth: string;
  /** 0 = tranquille, 1 = intensif. */
  pace: number;
  maxDrivingHoursPerDay: number;
  /** 0 = nature, 1 = ville. */
  natureVsCity: number;
  /** Where they're willing to sleep — both can be true at once. */
  freeSpots: boolean;
  campsites: boolean;
  constraints: DatedConstraint[];
}

const defaultProfile: TravelerProfile = {
  party: null,
  children: [],
  interests: [],
  budgetEur: 1500,
  nights: 10,
  destination: "",
  datesFixed: false,
  startDate: "",
  endDate: "",
  flexibleMonth: "",
  pace: 0.5,
  maxDrivingHoursPerDay: 4,
  natureVsCity: 0.5,
  freeSpots: true,
  campsites: true,
  constraints: [],
};

interface TravelerProfileState {
  profile: TravelerProfile;
  /** True once the wizard has been completed at least once — a hub screen
   * shows a "compléter mon profil" prompt instead of populated cards until
   * then, rather than presenting all-defaults as though they were chosen. */
  isSet: boolean;
  hydrate(): Promise<void>;
  update(patch: Partial<TravelerProfile>): Promise<void>;
  addChild(): Promise<void>;
  updateChildAge(id: string, age: number): Promise<void>;
  removeChild(id: string): Promise<void>;
  toggleInterest(interest: Interest): Promise<void>;
  addConstraint(label: string, date: string): Promise<void>;
  removeConstraint(id: string): Promise<void>;
  markComplete(): Promise<void>;
}

async function persist(profile: TravelerProfile, isSet: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, isSet }));
  } catch {
    // Best-effort — same reasoning as every other store in this app.
  }
}

export const useTravelerProfileStore = create<TravelerProfileState>((set, get) => ({
  profile: defaultProfile,
  isSet: false,

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { profile: Partial<TravelerProfile>; isSet: boolean };
        set({ profile: { ...defaultProfile, ...saved.profile }, isSet: saved.isSet ?? false });
        return;
      }
      // First run: the 60-second post-signup wizard already collected a
      // party composition and a rough destination/dates — carry them over
      // instead of asking again, so the full profile opens pre-filled
      // rather than blank. One-time only: once this store has its own
      // saved state, that always wins.
      const setupDraft = useProfileStore.getState();
      if (setupDraft.status === "completed" || setupDraft.status === "in_progress") {
        const seeded: TravelerProfile = {
          ...defaultProfile,
          party: setupDraft.traveler.party,
          destination: setupDraft.traveler.destination,
          datesFixed: setupDraft.traveler.datesFixed,
          startDate: setupDraft.traveler.startDate,
          endDate: setupDraft.traveler.endDate,
        };
        set({ profile: seeded });
        await persist(seeded, false);
      }
    } catch {
      // Storage unavailable — start fresh.
    }
  },

  async update(patch) {
    const profile = { ...get().profile, ...patch };
    set({ profile });
    await persist(profile, get().isSet);
  },

  async addChild() {
    const children = [...get().profile.children, { id: `child_${Date.now()}`, age: 8 }];
    await get().update({ children });
  },

  async updateChildAge(id, age) {
    const children = get().profile.children.map((c) => (c.id === id ? { ...c, age } : c));
    await get().update({ children });
  },

  async removeChild(id) {
    const children = get().profile.children.filter((c) => c.id !== id);
    await get().update({ children });
  },

  async toggleInterest(interest) {
    const current = get().profile.interests;
    const interests = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    await get().update({ interests });
  },

  async addConstraint(label, date) {
    const constraints = [...get().profile.constraints, { id: `constraint_${Date.now()}`, label, date }];
    await get().update({ constraints });
  },

  async removeConstraint(id) {
    const constraints = get().profile.constraints.filter((c) => c.id !== id);
    await get().update({ constraints });
  },

  async markComplete() {
    set({ isSet: true });
    await persist(get().profile, true);
  },
}));
