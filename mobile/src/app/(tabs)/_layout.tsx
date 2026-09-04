import { useRouter } from "expo-router";
import {
  Archive,
  ArrowRotateLeft,
  Bookmark,
  Calendar,
  Chart2,
  Clock,
  Gallery,
  Global,
  Home2,
  Layer,
  Location,
  Notification,
  People,
  Setting2,
  Task,
  Wallet,
} from "iconsax-react-native";

import {
  TabDesign9 as TabDesign,
  type ActionConfig,
  type TabConfig,
} from "../../components/screens/tabs/TabDesign9";
import { useOnboardingStore } from "../../store/onboardingStore";

// The route list. The bar's look lives in the TabDesign* component — swap the
// single import above (TabDesign1 … 9) to reskin without touching this.
//
// `name` is the route's identity, not its label: it must match a file in this
// folder and be unique across the list. `title` is also the visible label
// under each icon.
const TABS: TabConfig[] = [
  { name: "index", title: "Home", icon: Home2 },
  { name: "tab1", title: "Inbox", icon: Archive },
  { name: "tab2", title: "Alerts", icon: Notification, badge: 1 },
  { name: "tab3", title: "Layers", icon: Layer },
];

// The overflow tabs the `+` button reveals — destinations that didn't fit in
// the bar, not commands. `key` is a plain list key, NOT a route file: none of
// these has a screen yet, so `onPress` is left unset and a tap just closes
// the grid. Give one `onPress: () => router.push("/…")` once its screen
// exists — or promote it into `TABS` above if it earns a permanent slot.
//
// Module-level, unlike the "Onboarding" entry below it: these need no hook,
// so there's no reason to rebuild this array on every render.
const DESTINATION_ACTIONS: ActionConfig[] = [
  { key: "calendar", label: "Calendar", icon: Calendar },
  { key: "tasks", label: "Tasks", icon: Task },
  { key: "stats", label: "Stats", icon: Chart2 },
  { key: "people", label: "People", icon: People },
  { key: "gallery", label: "Gallery", icon: Gallery },
  { key: "saved", label: "Saved", icon: Bookmark },
  { key: "history", label: "History", icon: Clock },
  { key: "places", label: "Places", icon: Location },
  { key: "wallet", label: "Wallet", icon: Wallet },
  { key: "explore", label: "Explore", icon: Global },
  { key: "settings", label: "Settings", icon: Setting2 },
];

export default function TabLayout() {
  const router = useRouter();
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  // A dev/preview affordance, not a destination like the rest of the grid —
  // clears the "seen" flag (so onboarding shows again on the next cold
  // start too, not just this tap) and jumps straight there to preview it
  // without restarting the app. Built here rather than in
  // `DESTINATION_ACTIONS` because it needs `useRouter`/`useOnboardingStore`,
  // which only work inside the component.
  const actions: ActionConfig[] = [
    ...DESTINATION_ACTIONS,
    {
      key: "reset-onboarding",
      label: "Onboarding",
      icon: ArrowRotateLeft,
      onPress: () => {
        resetOnboarding();
        router.push("/onboarding" as any);
      },
    },
  ];

  return <TabDesign tabs={TABS} actions={actions} />;
}
