import type { PartyComposition } from "../../store/travelerProfileStore";

interface StepDef {
  key: string;
  route: string;
}

const ALL_STEPS: StepDef[] = [
  { key: "party", route: "/profile/traveler/party" },
  { key: "children", route: "/profile/traveler/children" },
  { key: "interests", route: "/profile/traveler/interests" },
  { key: "budget", route: "/profile/traveler/budget" },
  { key: "destination", route: "/profile/traveler/destination" },
  { key: "preferences", route: "/profile/traveler/preferences" },
];

/**
 * The "Enfants" step only makes sense for a family — everyone else's wizard
 * skips straight from "Qui vient" to "Intérêts". Step count and dot
 * position both derive from this one list so the two can't drift apart.
 */
export function travelerSteps(party: PartyComposition | null) {
  return party === "family" ? ALL_STEPS : ALL_STEPS.filter((s) => s.key !== "children");
}

export function stepInfo(party: PartyComposition | null, key: string) {
  const steps = travelerSteps(party);
  const index = steps.findIndex((s) => s.key === key);
  return {
    step: index,
    stepCount: steps.length,
    nextRoute: steps[index + 1]?.route ?? null,
    backRoute: steps[index - 1]?.route ?? null,
  };
}
