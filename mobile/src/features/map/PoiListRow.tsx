import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { mapPins } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Poi } from "../../mocks/pois";
import { CATEGORY_BY_KIND, ICON_BY_KIND, POI_KIND_LABEL } from "./types";

interface PoiListRowProps {
  poi: Poi;
  distanceKm?: number;
  onPress: () => void;
}

export function PoiListRow({ poi, distanceKm, onPress }: PoiListRowProps) {
  const { theme } = useTheme();
  const color = mapPins[CATEGORY_BY_KIND[poi.kind]];
  const icon = ICON_BY_KIND[poi.kind];

  return (
    <Pressable onPress={onPress} style={[styles.row, { borderColor: theme.colors.line }]}>
      <View style={[styles.iconWrap, { backgroundColor: color }]}>
        {icon ? <Ionicons name={icon} size={16} color="#FFFFFF" /> : (
          <Text style={[typography.caption, { color: "#FFFFFF", fontSize: 9, letterSpacing: 0 }]}>WC</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.button, { color: theme.colors.ink }]} numberOfLines={1}>{poi.name}</Text>
        <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{POI_KIND_LABEL[poi.kind]}</Text>
      </View>
      {distanceKm !== undefined ? (
        <Text style={[typography.mono, { color: theme.colors.inkMuted, fontSize: 13 }]}>{distanceKm.toFixed(1)} km</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, height: 60, paddingHorizontal: 4 },
  iconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
});
