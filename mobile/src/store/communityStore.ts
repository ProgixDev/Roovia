import { create } from "zustand";

import type { CommunityReview, CommunityTrip } from "../mocks/community";

export type Visibility = "public" | "amis" | "prive";

interface CommunityState {
  followedAuthorIds: string[];
  favoriteTripIds: string[];
  blockedAuthorIds: string[];
  reportedTripIds: string[];
  /** Reviews submitted this session — merged with each trip's own seeded reviews for display, never mutating the mock data itself. */
  reviewsByTrip: Record<string, CommunityReview[]>;
  /** Trips published from a real local trip — appear in the feed alongside the seeded mock set. */
  myPublished: (CommunityTrip & { visibility: Visibility })[];
  toggleFollow(authorId: string): void;
  toggleFavorite(tripId: string): void;
  block(authorId: string): void;
  report(tripId: string): void;
  addReview(tripId: string, authorName: string, ratingOutOf5: number, comment: string): void;
  publish(trip: CommunityTrip, visibility: Visibility): void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  followedAuthorIds: [],
  favoriteTripIds: [],
  blockedAuthorIds: [],
  reportedTripIds: [],
  reviewsByTrip: {},
  myPublished: [],

  toggleFollow(authorId) {
    const current = get().followedAuthorIds;
    set({ followedAuthorIds: current.includes(authorId) ? current.filter((id) => id !== authorId) : [...current, authorId] });
  },

  toggleFavorite(tripId) {
    const current = get().favoriteTripIds;
    set({ favoriteTripIds: current.includes(tripId) ? current.filter((id) => id !== tripId) : [...current, tripId] });
  },

  block(authorId) {
    if (get().blockedAuthorIds.includes(authorId)) return;
    set({ blockedAuthorIds: [...get().blockedAuthorIds, authorId] });
  },

  report(tripId) {
    if (get().reportedTripIds.includes(tripId)) return;
    set({ reportedTripIds: [...get().reportedTripIds, tripId] });
  },

  addReview(tripId, authorName, ratingOutOf5, comment) {
    const current = get().reviewsByTrip[tripId] ?? [];
    const review: CommunityReview = { id: `review_user_${Date.now()}`, authorName, ratingOutOf5, comment };
    set({ reviewsByTrip: { ...get().reviewsByTrip, [tripId]: [review, ...current] } });
  },

  publish(trip, visibility) {
    set({ myPublished: [{ ...trip, visibility }, ...get().myPublished] });
  },
}));
