import { View } from "react-native";

import { EmptyState } from "../../components/ui/EmptyState";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Placeholder — the real community feed (published itineraries, "adapt to
 * my profile", reviews, public profiles) is todo.md's "Community" section,
 * §10 in IMPLEMENTATION_PLAN.md. Registers the tab and route now.
 */
export default function CommunityFeedScreen() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
      <EmptyState
        icon="people-outline"
        title="Communauté"
        body="Les voyages partagés par d'autres voyageurs arriveront bientôt ici."
      />
    </View>
  );
}
