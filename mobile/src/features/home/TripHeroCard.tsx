import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Trip } from "../../store/tripsStore";

interface TripHeroCardProps {
  trip: Trip;
  onPress: () => void;
  onPressMore: () => void;
}

/**
 * The one-per-screen featured treatment — an in-progress trip, the thing
 * most worth a driver's attention right now. Horizontal layout (portrait
 * cover left, detail right) on purpose: it reads as a dashboard tile you
 * glance at, not a list row you scroll past like the compact cards below.
 */
export function TripHeroCard({ trip, onPress, onPressMore }: TripHeroCardProps) {
  const { theme } = useTheme();

  const share = () => {
    Share.share({
      message: `${trip.title} — ${trip.destination}${trip.dateRange ? ` (${trip.dateRange})` : ""}, sur Roovia.`,
    }).catch(() => {});
  };

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <View style={[styles.coverWrap, { backgroundColor: theme.colors.surface }]}>
        <Image
          source={trip.cover}
          style={[styles.cover, { backgroundColor: theme.colors.surfaceSunken }]}
          contentFit="cover"
          transition={200}
        />
      </View>

      <View style={styles.body}>
        <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 28, lineHeight: 29 }]}>
          {trip.title}
        </Text>
        {trip.dateRange ? (
          <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 6 }]}>
            {trip.dateRange}
          </Text>
        ) : null}

        <View style={styles.stats}>
          {trip.distanceKm !== null && (
            <View style={styles.stat}>
              <MaterialIcons name="route" size={20} color={theme.colors.lake} />
              <Text style={[typography.mono, styles.statValue, { color: theme.colors.ink }]}>
                {trip.distanceKm} km
              </Text>
            </View>
          )}
          {trip.distanceKm !== null && trip.budgetEur !== null && (
            <View style={[styles.statDivider, { backgroundColor: theme.colors.line }]} />
          )}
          {trip.budgetEur !== null && (
            <View style={styles.stat}>
              <Ionicons name="cash-outline" size={20} color={theme.colors.moss} />
              <Text style={[typography.mono, styles.statValue, { color: theme.colors.ink }]}>
                €{trip.budgetEur}
              </Text>
            </View>
          )}
          {trip.budgetEur !== null && trip.dayProgress && (
            <View style={[styles.statDivider, { backgroundColor: theme.colors.line }]} />
          )}
          {trip.dayProgress ? (
            <View style={styles.stat}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.inkMuted} />
              <Text style={[typography.mono, styles.statValue, { color: theme.colors.ink }]}>
                J{trip.dayProgress.current}/{trip.dayProgress.total}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <View style={[styles.statusPill, { backgroundColor: theme.colors.moss }]}>
            <View style={styles.statusDot} />
            <Text style={[typography.caption, styles.statusLabel]}>En route</Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={share}
              hitSlop={8}
              style={[styles.iconButton, { borderColor: theme.colors.line }]}
              accessibilityLabel="Partager"
            >
              <Ionicons name="share-outline" size={16} color={theme.colors.ink} />
            </Pressable>
            <Pressable
              onPress={onPressMore}
              hitSlop={8}
              style={[styles.iconButton, { borderColor: theme.colors.line }]}
              accessibilityLabel="Plus d'options"
            >
              <Ionicons name="ellipsis-horizontal" size={16} color={theme.colors.ink} />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  coverWrap: { width: "38%", padding: 8 },
  cover: { flex: 1, borderRadius: radius.lg - 8 },
  body: { flex: 1, padding: 16, justifyContent: "center", gap: 4 },
  stats: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  stat: { flex: 1, alignItems: "center", gap: 6 },
  statDivider: { width: 1, height: 32 },
  statValue: { fontSize: 13 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
  statusLabel: { color: "#FFFFFF" },
  actions: { flexDirection: "row", gap: 8 },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
