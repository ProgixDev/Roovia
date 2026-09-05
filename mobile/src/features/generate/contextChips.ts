import { INTEREST_LABEL, PARTY_LABEL } from "../traveler/labels";
import type { TravelerProfile } from "../../store/travelerProfileStore";
import { VEHICLE_TYPE_LABEL } from "../vehicle/labels";
import type { Vehicle } from "../../store/vehiclesStore";

/**
 * The visible payoff of filling in §1/§2: every chip here traces straight
 * back to a traveler-profile or vehicle field, prefilled and editable
 * rather than re-asked. Order matters — party first (sets the tone), then
 * the vehicle constraint, then budget and interests.
 */
export function buildContextChips(profile: TravelerProfile, vehicle: Vehicle | null): string[] {
  const chips: string[] = [];

  if (profile.party) chips.push(PARTY_LABEL[profile.party]);
  if (profile.party === "family" && profile.children.length > 0) {
    chips.push(`${profile.children.length} enfant${profile.children.length > 1 ? "s" : ""}`);
  }
  if (vehicle) chips.push(`${VEHICLE_TYPE_LABEL[vehicle.type]} ${vehicle.heightM.toFixed(1)} m`);
  if (profile.budgetEur) chips.push(`budget ${profile.budgetEur} €`);
  for (const interest of profile.interests.slice(0, 3)) {
    chips.push(INTEREST_LABEL[interest]);
  }

  return chips;
}
