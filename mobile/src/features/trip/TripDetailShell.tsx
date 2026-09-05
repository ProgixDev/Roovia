import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Trip } from "../../store/tripsStore";

export type TripSegment = "itineraire" | "budget" | "depenses" | "checklist" | "journal" | "groupe";

const SEGMENTS: { value: TripSegment; label: string }[] = [
  { value: "itineraire", label: "Itinéraire" },
  { value: "budget", label: "Budget" },
  { value: "depenses", label: "Dépenses" },
  { value: "checklist", label: "Checklist" },
  { value: "journal", label: "Journal" },
  { value: "groupe", label: "Groupe" },
];

interface TripDetailShellProps {
  trip: Trip;
  onBack: () => void;
  onPressMore: () => void;
  /** Status pill, offline badge, start/finish button — whatever the itinéraire segment wants above the tab strip. */
  headerExtra?: ReactNode;
  segment: TripSegment;
  onChangeSegment: (segment: TripSegment) => void;
  children: ReactNode;
}

/**
 * The shared shell every trip-scoped section hangs off — see
 * IMPLEMENTATION_PLAN.md §4. Only "Itinéraire" has real content so far;
 * §7/§8/§9/§11/§12 each replace their own placeholder segment in turn
 * without touching this file or the others' content.
 */
export function TripDetailShell({ trip, onBack, onPressMore, headerExtra, segment, onChangeSegment, children }: TripDetailShellProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={14} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
          </Pressable>
          <Pressable onPress={onPressMore} hitSlop={14} style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.ink} />
          </Pressable>
        </View>

        <Text style={[typography.heroStat, { color: theme.colors.ink }]}>{trip.title}</Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 4 }]}>
          {trip.destination}
          {trip.dateRange ? ` · ${trip.dateRange}` : ""}
        </Text>

        {headerExtra ? <View style={{ marginTop: 16 }}>{headerExtra}</View> : null}

        <SegmentedControl segments={SEGMENTS} value={segment} onChange={onChangeSegment} scrollable />

        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
});
