import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { formatLength, formatWeight, type UnitSystem } from "../../lib/format";
import type { Vehicle } from "../../store/vehiclesStore";
import { VEHICLE_TYPE_LABEL } from "./labels";
import { VehicleSilhouette } from "./VehicleSilhouette";

interface VehicleCardProps {
  vehicle: Vehicle;
  active: boolean;
  units: UnitSystem;
  onPress: () => void;
  onPressMore: () => void;
}

export function VehicleCard({ vehicle, active, units, onPress, onPressMore }: VehicleCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: active ? theme.colors.blaze : theme.colors.line,
          shadowColor: theme.shadow.color,
          shadowOpacity: theme.shadow.opacity,
          shadowOffset: theme.shadow.offset,
          shadowRadius: theme.shadow.radius,
          elevation: theme.shadow.elevation,
        },
      ]}
    >
      <View style={[styles.thumb, { backgroundColor: theme.colors.surfaceSunken }]}>
        <VehicleSilhouette type={vehicle.type} heightM={vehicle.heightM} lengthM={vehicle.lengthM} weightKg={vehicle.weightKg} unit={units} compact />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[typography.cardTitle, { color: theme.colors.ink, flex: 1 }]} numberOfLines={1}>
            {vehicle.name || VEHICLE_TYPE_LABEL[vehicle.type]}
          </Text>
          <Pressable onPress={onPressMore} hitSlop={10}>
            <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.inkMuted} />
          </Pressable>
        </View>

        <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 2 }]}>
          {VEHICLE_TYPE_LABEL[vehicle.type]}
        </Text>

        <View style={styles.statsRow}>
          <Text style={[typography.mono, styles.stat, { color: theme.colors.ink }]}>
            {formatLength(vehicle.heightM, units)}
          </Text>
          <Text style={[typography.mono, styles.stat, { color: theme.colors.ink }]}>
            {formatLength(vehicle.lengthM, units)}
          </Text>
          <Text style={[typography.mono, styles.stat, { color: theme.colors.ink }]}>
            {formatWeight(vehicle.weightKg, units)}
          </Text>
        </View>

        {active ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.blaze }]}>
            <Text style={[typography.caption, { color: theme.colors.blazeInk }]}>Actif</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
  thumb: { width: "36%", alignItems: "center", justifyContent: "center" },
  body: { flex: 1, padding: 14, gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  stat: { fontSize: 12 },
  badge: { position: "absolute", top: 10, right: 10, paddingHorizontal: 8, height: 20, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
});
