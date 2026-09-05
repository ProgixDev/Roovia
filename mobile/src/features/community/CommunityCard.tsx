import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { CommunityTrip } from "../../mocks/community";
import { VEHICLE_TYPE_LABEL } from "../vehicle/labels";

interface CommunityCardProps {
  trip: CommunityTrip;
  onPress: () => void;
}

export function CommunityCard({ trip, onPress }: CommunityCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.line,
          shadowColor: theme.shadow.color,
          shadowOpacity: theme.shadow.opacity,
          shadowOffset: theme.shadow.offset,
          shadowRadius: theme.shadow.radius,
          elevation: theme.shadow.elevation,
        },
      ]}
    >
      <Image source={trip.cover} style={[styles.cover, { backgroundColor: theme.colors.surfaceSunken }]} contentFit="cover" transition={200} />
      <View style={styles.body}>
        <Text style={[typography.cardTitle, { color: theme.colors.ink }]} numberOfLines={1}>{trip.title}</Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 12, marginTop: 2 }]}>Par {trip.author.name}</Text>

        <View style={styles.statsRow}>
          <Text style={[typography.mono, styles.stat, { color: theme.colors.ink }]}>{trip.country}</Text>
          <Text style={[typography.mono, styles.stat, { color: theme.colors.ink }]}>{trip.durationNights}j</Text>
          <Text style={[typography.mono, styles.stat, { color: theme.colors.ink }]}>{trip.budgetEur} €</Text>
          <Text style={[typography.mono, styles.stat, { color: theme.colors.ink }]}>{VEHICLE_TYPE_LABEL[trip.vehicleType]}</Text>
        </View>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color={theme.colors.amber} />
          <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 12 }]}>{trip.ratingOutOf5} / 5</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
  cover: { width: "100%", height: 130 },
  body: { padding: 14, gap: 4 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  stat: { fontSize: 11 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
});
