import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Share, StyleSheet, Text, View } from "react-native";

import { ActionSheet, type ActionSheetAction } from "../../components/ui/ActionSheet";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { RooviaMap } from "../map/RooviaMap";
import { interpolateAlongRoute } from "../map/useMapRegion";
import type { MapPinData } from "../map/types";
import { useGenerationStore } from "../../store/generationStore";
import { useItineraryStore } from "../../store/itineraryStore";
import { useTripsStore } from "../../store/tripsStore";
import { useVehiclesStore } from "../../store/vehiclesStore";
import type { Stop } from "../../mocks/itineraries";
import { BudgetSummary } from "./BudgetSummary";
import { DayCard } from "./DayCard";
import { DaySelector } from "./DaySelector";
import { LivePositionBanner } from "./LivePositionBanner";
import { StopDetailSheet } from "./StopDetailSheet";
import { TripDetailShell, type TripSegment } from "./TripDetailShell";

const REFINEMENTS: { key: "more_hiking" | "cheaper" | "less_driving"; label: string; icon: ActionSheetAction["icon"] }[] = [
  { key: "more_hiking", label: "Plus de randonnée", icon: "walk-outline" },
  { key: "cheaper", label: "Moins cher", icon: "cash-outline" },
  { key: "less_driving", label: "Moins de route", icon: "speedometer-outline" },
];

const PLACEHOLDER_COPY: Record<Exclude<TripSegment, "itineraire">, { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }> = {
  budget: { icon: "wallet-outline", title: "Budget", body: "Le suivi estimé vs réel arrive dans cette section." },
  depenses: { icon: "people-outline", title: "Dépenses partagées", body: "Ajoutez et répartissez les dépenses du groupe ici, bientôt." },
  checklist: { icon: "checkbox-outline", title: "Checklist", body: "La liste de départ générée pour ce voyage arrivera ici." },
  journal: { icon: "book-outline", title: "Journal de voyage", body: "L'enregistrement de votre trajet et vos souvenirs, bientôt." },
  groupe: { icon: "people-circle-outline", title: "Groupe", body: "Invitez des co-voyageurs et partagez la position en direct, bientôt." },
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  const trip = useTripsStore((s) => s.trips.find((t) => t.id === id));
  const duplicateTrip = useTripsStore((s) => s.duplicate);
  const archiveTrip = useTripsStore((s) => s.archive);
  const removeTrip = useTripsStore((s) => s.remove);
  const startTrip = useTripsStore((s) => s.startTrip);
  const finishTrip = useTripsStore((s) => s.finishTrip);

  const itinerary = useItineraryStore((s) => s.itineraries[id]);
  const toggleLock = useItineraryStore((s) => s.toggleLock);
  const toggleFavorite = useItineraryStore((s) => s.toggleFavorite);
  const moveStop = useItineraryStore((s) => s.moveStop);
  const removeStop = useItineraryStore((s) => s.removeStop);
  const setActiveVersion = useItineraryStore((s) => s.setActiveVersion);
  const refine = useGenerationStore((s) => s.refine);

  const activeVehicle = useVehiclesStore((s) => s.vehicles.find((v) => v.id === s.activeId)) ?? null;

  const [segment, setSegment] = useState<TripSegment>("itineraire");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeVersion = itinerary?.versions.find((v) => v.id === itinerary.activeVersionId);
  const versionIndex = itinerary?.versions.findIndex((v) => v.id === itinerary.activeVersionId) ?? -1;

  const visibleDays = activeDayId ? activeVersion?.days.filter((d) => d.id === activeDayId) : activeVersion?.days;
  const routeCoordinates = (visibleDays ?? []).flatMap((day) => day.stops.map((s) => s.coordinate));
  const allStopsInOrder = activeVersion?.days.flatMap((d) => d.stops) ?? [];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => Math.min(1, p + 0.015));
      }, 400);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  useEffect(() => {
    if (progress >= 1) setPlaying(false);
  }, [progress]);

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

  const versionActions: ActionSheetAction[] =
    itinerary?.versions.map((v, i) => ({
      key: v.id,
      label: `${i + 1}. ${v.label}`,
      icon: v.id === itinerary.activeVersionId ? "radio-button-on" : "radio-button-off",
      onPress: () => setActiveVersion(trip.id, v.id),
    })) ?? [];

  const pins: MapPinData[] = (visibleDays ?? []).flatMap((day) =>
    day.stops.map((stop, i) => ({ id: stop.id, kind: "viewpoint" as const, coordinate: stop.coordinate, order: i === 0 ? day.index : undefined })),
  );
  // Only in the "Tous les jours" view — the marker's position is computed
  // over the whole trip, so showing it while a single day is filtered would
  // place it outside that day's route and skew the map's fit-to-bounds.
  const liveMarker =
    trip.status === "in_progress" && activeDayId === null && allStopsInOrder.length > 0
      ? (interpolateAlongRoute(allStopsInOrder.map((s) => s.coordinate), progress) ?? undefined)
      : undefined;
  const nextStopIndex = Math.min(allStopsInOrder.length - 1, Math.floor(progress * allStopsInOrder.length));
  const nextStop = progress < 1 ? (allStopsInOrder[nextStopIndex] ?? null) : null;

  const headerExtra = (
    <View style={{ gap: 12 }}>
      <View style={styles.statusRow}>
        {trip.status === "in_progress" ? (
          <View style={[styles.pill, { backgroundColor: theme.colors.moss }]}>
            <Text style={[typography.caption, { color: "#FFFFFF" }]}>En route</Text>
          </View>
        ) : trip.status === "past" ? (
          <View style={[styles.pill, { backgroundColor: theme.colors.surfaceSunken }]}>
            <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Terminé</Text>
          </View>
        ) : (
          <View style={[styles.pill, { backgroundColor: theme.colors.blaze }]}>
            <Text style={[typography.caption, { color: theme.colors.blazeInk }]}>Prêt</Text>
          </View>
        )}
        {trip.status === "in_progress" ? (
          <View style={styles.offlinePill}>
            <Ionicons name="cloud-offline-outline" size={13} color={theme.colors.inkMuted} />
            <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Disponible hors ligne</Text>
          </View>
        ) : null}
      </View>

      {trip.status === "in_progress" ? (
        <>
          <LivePositionBanner playing={playing} progress={progress} nextStop={nextStop} onTogglePlay={() => setPlaying((p) => !p)} />
          <Button label="Terminer le voyage" variant="secondary" onPress={() => finishTrip(trip.id)} />
        </>
      ) : trip.status !== "past" ? (
        <Button label="Démarrer le voyage" icon="play" onPress={() => startTrip(trip.id, activeVersion?.days.length ?? 1)} />
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <TripDetailShell
        trip={trip}
        onBack={goBack}
        onPressMore={() => setMenuOpen(true)}
        headerExtra={headerExtra}
        segment={segment}
        onChangeSegment={setSegment}
      >
        {segment !== "itineraire" ? (
          <EmptyState {...PLACEHOLDER_COPY[segment]} />
        ) : !itinerary || !activeVersion ? (
          <EmptyState
            icon="map-outline"
            title="Pas encore d'itinéraire"
            body="Ce voyage n'a pas été généré par l'IA — l'itinéraire détaillé n'est pas encore disponible."
          />
        ) : (
          <>
            <BudgetSummary days={activeVersion.days} totalBudgetEur={activeVersion.totalBudgetEur} />

            <View style={styles.actionsRow}>
              <View style={{ flex: 1 }}>
                <Button label="Affiner" variant="secondary" icon="sparkles-outline" onPress={() => setRefineOpen(true)} />
              </View>
              {itinerary.versions.length > 1 ? (
                <Button label={`V${versionIndex + 1}/${itinerary.versions.length}`} variant="secondary" icon="time-outline" onPress={() => setVersionsOpen(true)} />
              ) : null}
            </View>

            <View style={styles.itineraryHeader}>
              <DaySelector days={activeVersion.days} activeDayId={activeDayId} onSelect={setActiveDayId} />
              <SegmentedControl
                segments={[{ value: "list", label: "Liste" }, { value: "map", label: "Carte" }]}
                value={viewMode}
                onChange={setViewMode}
              />
            </View>

            {viewMode === "map" ? (
              <View style={[styles.bigMap, { borderColor: theme.colors.line }]}>
                <RooviaMap route={{ coordinates: routeCoordinates }} pins={pins} liveMarker={liveMarker} onPressPin={(pinId) => setSelectedStop(allStopsInOrder.find((s) => s.id === pinId) ?? null)} style={{ flex: 1 }} />
              </View>
            ) : (
              <>
                {routeCoordinates.length > 0 ? (
                  <View style={[styles.mapPreview, { borderColor: theme.colors.line }]}>
                    <RooviaMap route={{ coordinates: routeCoordinates }} pins={pins} liveMarker={liveMarker} interactive={false} style={{ flex: 1 }} />
                  </View>
                ) : null}
                {(visibleDays ?? []).map((day) => (
                  <DayCard
                    key={day.id}
                    day={day}
                    lockedStopIds={itinerary.lockedStopIds}
                    activeVehicle={activeVehicle}
                    onPressStop={setSelectedStop}
                    onToggleLock={(stopId) => toggleLock(trip.id, stopId)}
                    onMoveStop={(stopId, direction) => moveStop(trip.id, day.id, stopId, direction)}
                    onRemoveStop={(stopId) => removeStop(trip.id, day.id, stopId)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </TripDetailShell>

      <ActionSheet visible={menuOpen} onClose={() => setMenuOpen(false)} title={trip.title} actions={menuActions} />
      <ActionSheet
        visible={refineOpen}
        onClose={() => setRefineOpen(false)}
        title="Affiner l'itinéraire"
        actions={REFINEMENTS.map((r) => ({ key: r.key, label: r.label, icon: r.icon, onPress: () => refine(trip.id, r.key, r.label) }))}
      />
      <ActionSheet visible={versionsOpen} onClose={() => setVersionsOpen(false)} title="Historique des versions" actions={versionActions} />
      <StopDetailSheet
        stop={selectedStop}
        favorite={selectedStop ? (itinerary?.favoriteStopIds.includes(selectedStop.id) ?? false) : false}
        onClose={() => setSelectedStop(null)}
        onToggleFavorite={() => selectedStop && toggleFavorite(trip.id, selectedStop.id)}
        onRemove={() => {
          if (!selectedStop) return;
          const day = activeVersion?.days.find((d) => d.stops.some((s) => s.id === selectedStop.id));
          if (day) removeStop(trip.id, day.id, selectedStop.id);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pill: { height: 26, paddingHorizontal: 12, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  offlinePill: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionsRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  itineraryHeader: { gap: 12 },
  mapPreview: { height: 160, borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
  bigMap: { height: 380, borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
});
