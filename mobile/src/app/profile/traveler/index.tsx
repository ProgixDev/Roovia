import { Redirect } from "expo-router";

/**
 * The old editable hub is gone — the traveler wizard is now always entered
 * fresh (pre-filled from the store) starting at "Qui", with "Bilan" acting
 * as the summary/view screen instead of a separate hub. This redirect keeps
 * any existing deep link to `/profile/traveler` working.
 */
export default function TravelerProfileIndex() {
  return <Redirect href={"/profile/traveler/who" as any} />;
}
