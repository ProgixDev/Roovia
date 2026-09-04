import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Trip, TripStatus } from "../../store/tripsStore";

interface TripCompactCardProps {
  trip: Trip;
  onPressMore: () => void;
}

// "Ready" for a fully-planned upcoming trip; past/draft trips reuse this
// card without a pill at all (see the render below) rather than stretching
// this label to cover a state it doesn't describe.
const READY_STATUS: Partial<Record<TripStatus, { label: string; icon: keyof typeof Ionicons.glyphMap }>> = {
  upcoming: { label: "Prêt", icon: "checkmark-circle" },
};

/**
 * Every trip that isn't the one featured `TripHeroCard` — cover on top,
 * everything else stacked below. Deliberately smaller/quieter than the
 * hero treatment: this is a list you scan, not a dashboard you glance at.
 */
export function TripCompactCard({ trip, onPressMore }: TripCompactCardProps) {
  const { theme } = useTheme();
  const ready = READY_STATUS[trip.status];

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <View style={styles.coverWrap}>
        <Image
          source={trip.cover}
          style={[styles.cover, { backgroundColor: theme.colors.surfaceSunken }]}
          contentFit="cover"
          transition={200}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[typography.cardTitle, { color: theme.colors.ink, flex: 1 }]} numberOfLines={1}>
            {trip.title}
          </Text>
          <Pressable
            onPress={onPressMore}
            hitSlop={10}
            style={[styles.iconButton, { borderColor: theme.colors.line }]}
            accessibilityLabel="Plus d'options"
          >
            <Ionicons name="ellipsis-horizontal" size={15} color={theme.colors.ink} />
          </Pressable>
        </View>

        {trip.dateRange ? (
          <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 2 }]}>
            {trip.dateRange}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.stats}>
            {trip.distanceKm !== null && (
              <View style={styles.stat}>
                <MaterialIcons name="route" size={14} color={theme.colors.lake} />
                <Text style={[typography.mono, styles.statValue, { color: theme.colors.ink }]}>
                  {trip.distanceKm} km
                </Text>
              </View>
            )}
            {trip.budgetEur !== null && (
              <View style={styles.stat}>
                <Ionicons name="cash-outline" size={14} color={theme.colors.moss} />
                <Text style={[typography.mono, styles.statValue, { color: theme.colors.ink }]}>
                  {trip.budgetEur} €
                </Text>
              </View>
            )}
            {trip.distanceKm === null && (
              <Text style={[typography.body, { color: theme.colors.inkMuted }]}>À définir</Text>
            )}
          </View>

          {ready ? (
            <View style={[styles.statusPill, { backgroundColor: theme.colors.blaze }]}>
              <Ionicons name={ready.icon} size={13} color={theme.colors.blazeInk} />
              <Text style={[typography.caption, { color: theme.colors.blazeInk }]}>{ready.label}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
  coverWrap: { width: "38%", padding: 8, backgroundColor: "#FFFFFF" },
  cover: { flex: 1, borderRadius: radius.lg - 8 },
  body: { flex: 1, padding: 14, justifyContent: "center", gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  stats: { flexDirection: "row", gap: 14 },
  stat: { flexDirection: "row", alignItems: "center", gap: 5 },
  statValue: { fontSize: 12 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
});
