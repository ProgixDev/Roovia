import { View } from "react-native";

import { EmptyState } from "../../components/ui/EmptyState";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Placeholder — the real services map (fuel/water/dump/toilets/bivouac/
 * campsite/parking/viewpoint layers, filters, POI detail) is todo.md's
 * "Van / camping-car services map" section, §6 in IMPLEMENTATION_PLAN.md.
 * This registers the tab and its route now so navigation is complete.
 */
export default function ServicesMapScreen() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
      <EmptyState
        icon="map-outline"
        title="Carte des services"
        body="Stations, points d'eau, aires de services et bivouacs arrivent ici."
      />
    </View>
  );
}
