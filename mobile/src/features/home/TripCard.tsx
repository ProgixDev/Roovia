import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Trip, TripStatus } from "../../store/tripsStore";

const STATUS_LABEL: Record<TripStatus, string> = {
  draft: "Brouillon",
  upcoming: "À venir",
  in_progress: "En cours",
  past: "Terminé",
};

interface TripCardProps {
  trip: Trip;
  onPressMore: () => void;
}

/**
 * `expo-image`, not RN's core `Image` — this is the app's first remote
 * (non-`require`d) image, and expo-image's caching + `transition` fade
 * matter specifically because these are network-fetched Unsplash covers,
 * not bundled assets like onboarding's photos.
 */
export function TripCard({ trip, onPressMore }: TripCardProps) {
  const { theme } = useTheme();
  // Status colors are semantic, not brand — none of these reuse `blaze`
  // (reserved for actions) or the pin-only hues (`plum`/`slate`).
  const statusColor: Record<TripStatus, string> = {
    draft: theme.colors.inkMuted,
    upcoming: theme.colors.lake,
    in_progress: theme.colors.moss,
    past: theme.colors.contour,
  };

  const hasStats = trip.distanceKm !== null && trip.budgetEur !== null;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <View style={styles.coverWrap}>
        <Image
          source={{ uri: trip.coverUri }}
          style={[styles.cover, { backgroundColor: theme.colors.surfaceSunken }]}
          contentFit="cover"
          transition={200}
        />

        <View style={[styles.statusPill, { backgroundColor: statusColor[trip.status] }]}>
          <Text style={[typography.caption, styles.statusLabel]}>{STATUS_LABEL[trip.status]}</Text>
        </View>

        <Pressable
          onPress={onPressMore}
          hitSlop={10}
          style={styles.moreButton}
          accessibilityLabel="Plus d'options"
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={[typography.cardTitle, { color: theme.colors.ink }]} numberOfLines={1}>
          {trip.title}
        </Text>
        <Text style={[typography.body, styles.destination, { color: theme.colors.inkMuted }]}>
          {trip.destination}
          {trip.dateRange ? ` · ${trip.dateRange}` : ""}
        </Text>

        {hasStats ? (
          <Text style={[typography.mono, styles.stats, { color: theme.colors.ink }]}>
            {trip.distanceKm} km · {trip.budgetEur} €
          </Text>
        ) : (
          <Text style={[typography.body, styles.stats, { color: theme.colors.inkMuted }]}>
            Dates et budget à définir
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  coverWrap: { height: 150 },
  cover: { width: "100%", height: "100%" },
  statusPill: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: radius.pill,
    justifyContent: "center",
  },
  statusLabel: { color: "#FFFFFF" },
  moreButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 14, gap: 6 },
  destination: {},
  stats: { marginTop: 2 },
});
