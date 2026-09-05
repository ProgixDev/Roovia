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
