import { useRouter } from "expo-router";
import { Global, Home2, Map, Profile } from "iconsax-react-native";

import { TabBar, type TabConfig } from "../../features/navigation/TabBar";

// Voyages · Carte · [+] · Communauté · Profil — the approved 4-tab IA (see
// IMPLEMENTATION_PLAN.md §0.1). Everything trip-scoped (itinerary, budget,
// expenses, checklist, journal, group) lives inside trip detail instead of
// the tab bar; everything account-scoped lives inside Profil.
const TABS: TabConfig[] = [
  { name: "index", title: "Voyages", icon: Home2 },
  { name: "carte", title: "Carte", icon: Map },
  { name: "communaute", title: "Communauté", icon: Global },
  { name: "profil", title: "Profil", icon: Profile },
];

export default function TabLayout() {
  const router = useRouter();

  return <TabBar tabs={TABS} onPressFab={() => router.push("/generate" as any)} />;
}
