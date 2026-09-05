import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { tabBarReservedSpace } from "../../constants/layout";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { COMMUNITY_TRIPS } from "../../mocks/community";
import { useCommunityStore } from "../../store/communityStore";
import { CommunityCard } from "./CommunityCard";
import { CommunityFiltersSheet, EMPTY_FILTERS, type CommunityFilters } from "./CommunityFiltersSheet";

function matches(trip: (typeof COMMUNITY_TRIPS)[number], filters: CommunityFilters): boolean {
  if (filters.country && trip.country !== filters.country) return false;
  if (filters.vehicleType && trip.vehicleType !== filters.vehicleType) return false;
  if (filters.season && trip.season !== filters.season) return false;
  if (filters.durationBucket) {
    if (filters.durationBucket === "short" && trip.durationNights > 5) return false;
    if (filters.durationBucket === "medium" && (trip.durationNights <= 5 || trip.durationNights > 10)) return false;
    if (filters.durationBucket === "long" && trip.durationNights <= 10) return false;
  }
  if (filters.budgetBucket) {
    if (filters.budgetBucket === "low" && trip.budgetEur > 500) return false;
    if (filters.budgetBucket === "mid" && (trip.budgetEur <= 500 || trip.budgetEur > 1000)) return false;
    if (filters.budgetBucket === "high" && trip.budgetEur <= 1000) return false;
  }
  return true;
}

export default function CommunityFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [filters, setFilters] = useState<CommunityFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const myPublished = useCommunityStore((s) => s.myPublished);

  const allTrips = useMemo(
    () => [...myPublished.filter((t) => t.visibility === "public"), ...COMMUNITY_TRIPS],
    [myPublished],
  );
  const countries = useMemo(() => Array.from(new Set(allTrips.map((t) => t.country))), [allTrips]);
  const visibleTrips = allTrips.filter((t) => matches(t, filters));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabBarReservedSpace(insets.bottom) + 24 }]}>
        <View style={styles.header}>
          <Text style={[typography.heroStat, { color: theme.colors.ink }]}>Communauté</Text>
          <Pressable onPress={() => setFiltersOpen(true)} style={[styles.filterButton, { borderColor: theme.colors.line, backgroundColor: activeFilterCount > 0 ? theme.colors.blaze : theme.colors.surface }]}>
            <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? theme.colors.blazeInk : theme.colors.ink} />
            {activeFilterCount > 0 ? (
              <Text style={[typography.caption, { color: theme.colors.blazeInk }]}>{activeFilterCount}</Text>
            ) : null}
          </Pressable>
        </View>
        <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 4 }]}>
          {visibleTrips.length} voyage{visibleTrips.length > 1 ? "s" : ""} partagé{visibleTrips.length > 1 ? "s" : ""} par la communauté
        </Text>

        <View style={styles.grid}>
          {visibleTrips.map((trip) => (
            <CommunityCard key={trip.id} trip={trip} onPress={() => router.push(`/community/${trip.id}` as any)} />
          ))}
        </View>
      </ScrollView>

      <CommunityFiltersSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} countries={countries} filters={filters} onChange={setFilters} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 4 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  filterButton: { flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1 },
  grid: { gap: 14, marginTop: 20 },
});
