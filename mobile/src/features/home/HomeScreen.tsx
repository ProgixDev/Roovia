import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActionSheet, type ActionSheetAction } from "../../components/ui/ActionSheet";
import { Chip } from "../../components/ui/Chip";
import { tabBarReservedSpace } from "../../constants/layout";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../store/authStore";
import { type Trip, type TripStatus, useTripsStore } from "../../store/tripsStore";
import { TripCompactCard } from "./TripCompactCard";
import { TripHeroCard } from "./TripHeroCard";
import { TripSummaryRow } from "./TripSummaryRow";

type Filter = "all" | TripStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "in_progress", label: "En cours" },
  { value: "upcoming", label: "À venir" },
  { value: "past", label: "Terminés" },
  { value: "draft", label: "Brouillons" },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const trips = useTripsStore((s) => s.trips);
  const refreshing = useTripsStore((s) => s.refreshing);
  const refresh = useTripsStore((s) => s.refresh);
  const duplicate = useTripsStore((s) => s.duplicate);
  const archive = useTripsStore((s) => s.archive);
  const remove = useTripsStore((s) => s.remove);

  const [filter, setFilter] = useState<Filter>("all");
  const [menuTripId, setMenuTripId] = useState<string | null>(null);

  const visible = trips.filter((t) => !t.archived);
  const byStatus = (status: TripStatus) => visible.filter((t) => t.status === status);
  const inProgress = byStatus("in_progress");
  const upcoming = byStatus("upcoming");
  const past = byStatus("past");
  const drafts = byStatus("draft");
  const isEmpty = visible.length === 0;

  const menuTrip = trips.find((t) => t.id === menuTripId) ?? null;

  const shareTrip = (trip: Trip) => {
    Share.share({
      message: `${trip.title} — ${trip.destination}${trip.dateRange ? ` (${trip.dateRange})` : ""}, sur Roovia.`,
    }).catch(() => {});
  };

  const confirmDelete = (trip: Trip) => {
    Alert.alert("Supprimer ce voyage ?", `« ${trip.title} » sera définitivement supprimé.`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => remove(trip.id) },
    ]);
  };

  const actionsFor = (trip: Trip): ActionSheetAction[] => [
    { key: "duplicate", label: "Dupliquer", icon: "copy-outline", onPress: () => duplicate(trip.id) },
    { key: "archive", label: "Archiver", icon: "archive-outline", onPress: () => archive(trip.id) },
    { key: "share", label: "Partager", icon: "share-outline", onPress: () => shareTrip(trip) },
    {
      key: "delete",
      label: "Supprimer",
      icon: "trash-outline",
      destructive: true,
      onPress: () => confirmDelete(trip),
    },
  ];

  const showAll = filter === "all";

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.blaze} />
        }
        contentContainerStyle={[
          styles.scroll,
          // Not `insets.top` — the root layout's own SafeAreaView already
          // reserves it for every non-full-bleed route, this tab included.
          // Bottom clears the floating tab bar, with real breathing room on
          // top of that, or the last card reads as crowded against it even
          // once it's no longer strictly hidden behind it.
          { paddingTop: 16, paddingBottom: tabBarReservedSpace(insets.bottom) + 48 },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={theme.logo} style={styles.logo} resizeMode="contain" />
            <Text style={[typography.sectionHead, styles.pageTitle, { color: theme.colors.ink }]}>Mes voyages</Text>
          </View>
          <Pressable
            onPress={() => router.push("/account" as any)}
            accessibilityLabel="Mon compte"
            style={[styles.avatar, { backgroundColor: theme.colors.blaze }]}
          >
            <Image
              source={{ uri: user?.avatarUri ?? "https://i.pravatar.cc/150?img=12" }}
              style={styles.avatarPhoto}
            />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                tone="ink"
                selected={filter === f.value}
                onPress={() => setFilter(f.value)}
              />
            ))}
          </View>
        </ScrollView>

        {isEmpty ? (
          <View style={styles.empty}>
            <Text style={[typography.cardTitle, { color: theme.colors.ink }]}>
              {"Aucun voyage pour l'instant"}
            </Text>
            <Text style={[typography.body, { color: theme.colors.inkMuted, textAlign: "center", marginTop: 6 }]}>
              {"Décrivez le voyage dont vous rêvez, l'IA s'occupe du reste."}
            </Text>
          </View>
        ) : (
          <>
            {(showAll || filter === "in_progress") && inProgress.length > 0 && (
              <View style={styles.section}>
                <Text style={[typography.sectionHead, styles.sectionTitle, { color: theme.colors.ink }]}>
                  En cours
                </Text>
                <View style={styles.cardStack}>
                  {inProgress.map((trip) => (
                    <TripHeroCard key={trip.id} trip={trip} onPressMore={() => setMenuTripId(trip.id)} />
                  ))}
                </View>
              </View>
            )}

            {(showAll || filter === "upcoming") && upcoming.length > 0 && (
              <View style={styles.section}>
                <Text style={[typography.sectionHead, styles.sectionTitle, { color: theme.colors.ink }]}>
                  À venir
                </Text>
                <View style={styles.cardStack}>
                  {upcoming.map((trip) => (
                    <TripCompactCard key={trip.id} trip={trip} onPressMore={() => setMenuTripId(trip.id)} />
                  ))}
                </View>
              </View>
            )}

            {(showAll || filter === "past") &&
              (showAll ? (
                past.length > 0 && (
                  <TripSummaryRow
                    label="Voyages passés"
                    count={past.length}
                    icon="time-outline"
                    onPress={() => setFilter("past")}
                  />
                )
              ) : (
                <View style={styles.cardStack}>
                  {past.map((trip) => (
                    <TripCompactCard key={trip.id} trip={trip} onPressMore={() => setMenuTripId(trip.id)} />
                  ))}
                </View>
              ))}

            {(showAll || filter === "draft") &&
              (showAll ? (
                drafts.length > 0 && (
                  <TripSummaryRow
                    label="Brouillons"
                    count={drafts.length}
                    icon="pencil-outline"
                    onPress={() => setFilter("draft")}
                  />
                )
              ) : (
                <View style={styles.cardStack}>
                  {drafts.map((trip) => (
                    <TripCompactCard key={trip.id} trip={trip} onPressMore={() => setMenuTripId(trip.id)} />
                  ))}
                </View>
              ))}
          </>
        )}
      </ScrollView>

      <ActionSheet
        visible={menuTrip !== null}
        onClose={() => setMenuTripId(null)}
        title={menuTrip?.title}
        actions={menuTrip ? actionsFor(menuTrip) : []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 34, height: 34 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarPhoto: { width: "100%", height: "100%" },
  filters: { flexGrow: 0 },
  filterRow: { flexDirection: "row", gap: 10, paddingRight: 20 },
  pageTitle: { fontSize: 32, lineHeight: 34 },
  section: { gap: 14 },
  sectionTitle: { fontSize: 28, lineHeight: 29 },
  cardStack: { gap: 14 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 10 },
});
