import { create } from "zustand";

export type MemberRole = "owner" | "editor" | "viewer";

export interface GroupMember {
  id: string;
  name: string;
  role: MemberRole;
}

export interface ConvoyVehicle {
  id: string;
  label: string;
}

export interface StopProposal {
  id: string;
  proposedBy: string;
  stopName: string;
  description: string;
  status: "pending" | "approved" | "rejected";
}

export interface StopComment {
  id: string;
  stopId: string;
  authorName: string;
  text: string;
}

interface GroupState {
  membersByTrip: Record<string, GroupMember[]>;
  convoyByTrip: Record<string, ConvoyVehicle[]>;
  proposalsByTrip: Record<string, StopProposal[]>;
  commentsByTrip: Record<string, StopComment[]>;
  /** A simulated "someone else edited this" banner — there's no second real user in this prototype to race against. */
  conflictByTrip: Record<string, boolean>;
  ensureOwner(tripId: string, ownerName: string): void;
  addMember(tripId: string, name: string, role: MemberRole): void;
  updateRole(tripId: string, memberId: string, role: MemberRole): void;
  removeMember(tripId: string, memberId: string): void;
  addConvoyVehicle(tripId: string, label: string): void;
  removeConvoyVehicle(tripId: string, vehicleId: string): void;
  proposeStop(tripId: string, proposedBy: string, stopName: string, description: string): void;
  respondToProposal(tripId: string, proposalId: string, approve: boolean): void;
  addComment(tripId: string, stopId: string, authorName: string, text: string): void;
  triggerSimulatedConflict(tripId: string): void;
  resolveConflict(tripId: string): void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  membersByTrip: {},
  convoyByTrip: {},
  proposalsByTrip: {},
  commentsByTrip: {},
  conflictByTrip: {},

  ensureOwner(tripId, ownerName) {
    if (get().membersByTrip[tripId]) return;
    set({ membersByTrip: { ...get().membersByTrip, [tripId]: [{ id: "me", name: ownerName, role: "owner" }] } });
  },

  addMember(tripId, name, role) {
    const current = get().membersByTrip[tripId] ?? [];
    set({ membersByTrip: { ...get().membersByTrip, [tripId]: [...current, { id: `member_${Date.now()}`, name, role }] } });
  },

  updateRole(tripId, memberId, role) {
    const current = get().membersByTrip[tripId] ?? [];
    set({ membersByTrip: { ...get().membersByTrip, [tripId]: current.map((m) => (m.id === memberId ? { ...m, role } : m)) } });
  },

  removeMember(tripId, memberId) {
    const current = get().membersByTrip[tripId] ?? [];
    set({ membersByTrip: { ...get().membersByTrip, [tripId]: current.filter((m) => m.id !== memberId) } });
  },

  addConvoyVehicle(tripId, label) {
    const current = get().convoyByTrip[tripId] ?? [];
    set({ convoyByTrip: { ...get().convoyByTrip, [tripId]: [...current, { id: `convoy_${Date.now()}`, label }] } });
  },

  removeConvoyVehicle(tripId, vehicleId) {
    const current = get().convoyByTrip[tripId] ?? [];
    set({ convoyByTrip: { ...get().convoyByTrip, [tripId]: current.filter((v) => v.id !== vehicleId) } });
  },

  proposeStop(tripId, proposedBy, stopName, description) {
    const current = get().proposalsByTrip[tripId] ?? [];
    const proposal: StopProposal = { id: `proposal_${Date.now()}`, proposedBy, stopName, description, status: "pending" };
    set({ proposalsByTrip: { ...get().proposalsByTrip, [tripId]: [proposal, ...current] } });
  },

  respondToProposal(tripId, proposalId, approve) {
    const current = get().proposalsByTrip[tripId] ?? [];
    set({
      proposalsByTrip: {
        ...get().proposalsByTrip,
        [tripId]: current.map((p) => (p.id === proposalId ? { ...p, status: approve ? "approved" : "rejected" } : p)),
      },
    });
  },

  addComment(tripId, stopId, authorName, text) {
    const current = get().commentsByTrip[tripId] ?? [];
    set({ commentsByTrip: { ...get().commentsByTrip, [tripId]: [...current, { id: `comment_${Date.now()}`, stopId, authorName, text }] } });
  },

  triggerSimulatedConflict(tripId) {
    set({ conflictByTrip: { ...get().conflictByTrip, [tripId]: true } });
  },

  resolveConflict(tripId) {
    set({ conflictByTrip: { ...get().conflictByTrip, [tripId]: false } });
  },
}));
