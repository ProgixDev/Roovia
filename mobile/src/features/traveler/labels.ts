import type { Interest, PartyComposition } from "../../store/travelerProfileStore";

export const PARTY_LABEL: Record<PartyComposition, string> = {
  solo: "Solo",
  couple: "En couple",
  family: "En famille",
  friends: "Entre amis",
};

export const INTEREST_LABEL: Record<Interest, string> = {
  beach: "Plage",
  hiking: "Randonnée",
  sport: "Sport",
  museums: "Musées",
  food: "Gastronomie",
  nature: "Nature",
};

/** The 3-way pace picker only ever writes 0 / 0.5 / 1 — anything else (an
 * old continuous value from before this became discrete) falls back to
 * "Équilibré" rather than showing nothing. */
export function paceLabel(pace: number): string {
  if (pace <= 0.25) return "Tranquille";
  if (pace >= 0.75) return "Intense";
  return "Équilibré";
}
