import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActionSheet, type ActionSheetAction } from "../../components/ui/ActionSheet";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { useGenerationStore } from "../../store/generationStore";
import { useItineraryStore } from "../../store/itineraryStore";
import { useTripsStore } from "../../store/tripsStore";
import { BudgetSummary } from "./BudgetSummary";
import { DayCard } from "./DayCard";
import { RooviaMap } from "../map/RooviaMap";
import type { MapPinData } from "../map/types";

const REFINEMENTS: { key: "more_hiking" | "cheaper" | "less_driving"; label: string; icon: ActionSheetAction["icon"] }[] = [
  { key: "more_hiking", label: "Plus de randonnée", icon: "walk-outline" },
  { key: "cheaper", label: "Moins cher", icon: "cash-outline" },
  { key: "less_driving", label: "Moins de route", icon: "speedometer-outline" },
];

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const trip = useTripsStore((s) => s.trips.find((t) => t.id === id));
  const duplicateTrip = useTripsStore((s) => s.duplicate);
  const archiveTrip = useTripsStore((s) => s.archive);
  const removeTrip = useTripsStore((s) => s.remove);

  const itinerary = useItineraryStore((s) => s.itineraries[id]);
  const toggleLock = useItineraryStore((s) => s.toggleLock);
  const moveStop = useItineraryStore((s) => s.moveStop);
  const removeStop = useItineraryStore((s) => s.removeStop);
  const setActiveVersion = useItineraryStore((s) => s.setActiveVersion);
  const refine = useGenerationStore((s) => s.refine);

  const [menuOpen, setMenuOpen] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  if (!trip) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
        <EmptyState icon="alert-circle-outline" title="Voyage introuvable" body="Ce voyage n'existe plus." />
      </View>
    );
  }

  const activeVersion = itinerary?.versions.find((v) => v.id === itinerary.activeVersionId);
  const versionIndex = itinerary?.versions.findIndex((v) => v.id === itinerary.activeVersionId) ?? -1;

  const share = () => {
    Share.share({ message: `${trip.title} — ${trip.destination}, sur Roovia.` }).catch(() => {});
  };

  const confirmDelete = () => {
    Alert.alert("Supprimer ce voyage ?", `« ${trip.title} » sera définitivement supprimé.`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => { removeTrip(trip.id); goBack(); } },
    ]);
  };

  const menuActions: ActionSheetAction[] = [
    { key: "duplicate", label: "Dupliquer", icon: "copy-outline", onPress: () => duplicateTrip(trip.id) },
    { key: "archive", label: "Archiver", icon: "archive-outline", onPress: () => { archiveTrip(trip.id); goBack(); } },
    { key: "share", label: "Partager", icon: "share-outline", onPress: share },
    { key: "delete", label: "Supprimer", icon: "trash-outline", destructive: true, onPress: confirmDelete },
  ];

  const runRefine = async (kind: (typeof REFINEMENTS)[number]) => {
    await refine(trip.id, kind.key, kind.label);
  };

  const versionActions: ActionSheetAction[] =
    itinerary?.versions.map((v, i) => ({
      key: v.id,
      label: `${i + 1}. ${v.label}`,
      icon: v.id === itinerary.activeVersionId ? "radio-button-on" : "radio-button-off",
      onPress: () => setActiveVersion(trip.id, v.id),
    })) ?? [];

  const pins: MapPinData[] =
    activeVersion?.days.flatMap((day) =>
      day.stops.map((stop, i) => ({ id: stop.id, kind: "viewpoint" as const, coordinate: stop.coordinate, order: i === 0 ? day.index : undefined })),
    ) ?? [];
  const routeCoordinates = activeVersion?.days.flatMap((day) => day.stops.map((s) => s.coordinate)) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      {/* No `tabBarReservedSpace` here — this is a root-level stack route,
          like /account, so the tabs' floating bar isn't shown underneath it. */}
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={14} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
          </Pressable>
          <Pressable onPress={() => setMenuOpen(true)} hitSlop={14} style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.ink} />
          </Pressable>
        </View>

        <Text style={[typography.heroStat, { color: theme.colors.ink }]}>{trip.title}</Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 4 }]}>
          {trip.destination}
          {trip.dateRange ? ` · ${trip.dateRange}` : ""}
        </Text>

        {routeCoordinates.length > 0 ? (
          <View style={[styles.mapPreview, { borderColor: theme.colors.line }]}>
            <RooviaMap route={{ coordinates: routeCoordinates }} pins={pins} interactive={false} style={{ flex: 1 }} />
          </View>
        ) : null}

        {activeVersion ? <BudgetSummary days={activeVersion.days} totalBudgetEur={activeVersion.totalBudgetEur} /> : null}

        <View style={styles.actionsRow}>
          <View style={{ flex: 1 }}>
            <Button label="Affiner" variant="secondary" icon="sparkles-outline" onPress={() => setRefineOpen(true)} />
          </View>
          {itinerary && itinerary.versions.length > 1 ? (
            <Pressable
              onPress={() => setVersionsOpen(true)}
              style={[styles.versionPill, { borderColor: theme.colors.line }]}
            >
              <Ionicons name="time-outline" size={15} color={theme.colors.ink} />
              <Text style={[typography.button, { color: theme.colors.ink, fontSize: 13 }]}>
                V{versionIndex + 1}/{itinerary.versions.length}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {activeVersion?.days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            lockedStopIds={itinerary?.lockedStopIds ?? []}
            onToggleLock={(stopId) => toggleLock(trip.id, stopId)}
            onMoveStop={(stopId, direction) => moveStop(trip.id, day.id, stopId, direction)}
            onRemoveStop={(stopId) => removeStop(trip.id, day.id, stopId)}
          />
        )) ?? (
          <EmptyState
            icon="map-outline"
            title="Pas encore d'itinéraire"
            body="Ce voyage n'a pas été généré par l'IA — l'itinéraire détaillé n'est pas encore disponible."
          />
        )}
      </ScrollView>

      <ActionSheet visible={menuOpen} onClose={() => setMenuOpen(false)} title={trip.title} actions={menuActions} />
      <ActionSheet
        visible={refineOpen}
        onClose={() => setRefineOpen(false)}
        title="Affiner l'itinéraire"
        actions={REFINEMENTS.map((r) => ({ key: r.key, label: r.label, icon: r.icon, onPress: () => runRefine(r) }))}
      />
      <ActionSheet visible={versionsOpen} onClose={() => setVersionsOpen(false)} title="Historique des versions" actions={versionActions} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  mapPreview: { height: 160, borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
  actionsRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  versionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 54,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
