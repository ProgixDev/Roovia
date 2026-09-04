import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { mapPins } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { CATEGORY_BY_KIND, ICON_BY_KIND, type PoiKind } from "./types";

interface MapPinProps {
  kind: PoiKind;
  order?: number;
  active?: boolean;
}

/**
 * Purely presentational — a circular badge, not the classic pointed teardrop,
 * so it reads as the same visual family as the app's other circular icon
 * badges (card action buttons, the euro stat badge) rather than a borrowed
 * skeuomorphic map-pin shape. Renderer-agnostic: `SketchRenderer` absolutely
 * positions it on its projected canvas, `MapboxRenderer` drops it straight
 * into a `PointAnnotation`/`MarkerView`.
 */
export function MapPin({ kind, order, active = false }: MapPinProps) {
  const color = mapPins[CATEGORY_BY_KIND[kind]];
  const size = active ? 36 : 30;
  const icon = ICON_BY_KIND[kind];

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: active ? 3 : 2,
        },
      ]}
    >
      {order !== undefined ? (
        <Text style={[typography.caption, styles.label]}>{order}</Text>
      ) : kind === "toilets" ? (
        <Text style={[typography.caption, styles.label, { fontSize: 9, letterSpacing: 0 }]}>WC</Text>
      ) : icon ? (
        <Ionicons name={icon} size={size * 0.5} color="#FFFFFF" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  label: { color: "#FFFFFF", textTransform: "none", letterSpacing: 0 },
});
