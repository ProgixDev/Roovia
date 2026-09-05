import { useEffect } from "react";
import { Share, StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Switch } from "../../components/ui/Switch";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { emptyArray } from "../../lib/emptyArray";
import { computeRecapStats } from "../../lib/journalStats";
import type { TripDay } from "../../mocks/itineraries";
import { useJournalStore } from "../../store/journalStore";
import type { TripStatus } from "../../store/tripsStore";
import { JournalEntryCard } from "./JournalEntryCard";

interface JournalSegmentProps {
  tripId: string;
  tripTitle: string;
  tripStatus: TripStatus;
  days: TripDay[] | undefined;
  totalDistanceKm: number;
  onPublish: () => void;
}

export function JournalSegment({ tripId, tripTitle, tripStatus, days, totalDistanceKm, onPublish }: JournalSegmentProps) {
  const { theme } = useTheme();
  const recording = useJournalStore((s) => s.recordingByTrip[tripId] ?? false);
  const batteryAware = useJournalStore((s) => s.batteryAwareByTrip[tripId] ?? true);
  const entries = useJournalStore((s) => s.entriesByTrip[tripId] ?? emptyArray());
  const toggleRecording = useJournalStore((s) => s.toggleRecording);
  const toggleBatteryAware = useJournalStore((s) => s.toggleBatteryAware);
  const ensureEntries = useJournalStore((s) => s.ensureEntries);
  const updateCaption = useJournalStore((s) => s.updateCaption);

  // Above the early returns below on purpose — every hook in this
  // component has to run on every render regardless of trip state, so the
  // "no days yet" / "already has entries" guards live inside the effect
  // instead of around the `useEffect` call itself.
  useEffect(() => {
    if (!days || days.length === 0 || entries.length > 0) return;
    ensureEntries(tripId, days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, days]);

  if (tripStatus === "draft" || tripStatus === "upcoming") {
    return (
      <EmptyState
        icon="recording-outline"
        title="Pas encore de journal"
        body="L'enregistrement démarre automatiquement une fois le voyage commencé."
      />
    );
  }

  if (!days || days.length === 0) {
    return <EmptyState icon="map-outline" title="Aucun itinéraire" body="Ce voyage n'a pas d'itinéraire à partir duquel construire un journal." />;
  }

  const stopCoordinates = days.flatMap((d) => d.stops.map((s) => s.coordinate));
  const recap = computeRecapStats(stopCoordinates, totalDistanceKm, days.length);

  const share = () => {
    Share.share({
      message: `${tripTitle} — ${recap.distanceKm} km, ${recap.stopCount} arrêts, ${recap.countryCount} pays. Suivez le voyage sur Roovia !`,
    }).catch(() => {});
  };

  return (
    <View style={{ gap: 20 }}>
      {tripStatus === "in_progress" ? (
        <View style={[styles.recordingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          <View style={styles.recordingRow}>
            <View style={styles.recordingLabel}>
              {recording ? <View style={[styles.recordingDot, { backgroundColor: theme.colors.danger }]} /> : null}
              <Text style={[typography.button, { color: theme.colors.ink }]}>Enregistrement du trajet</Text>
            </View>
            <Switch value={recording} onChange={() => toggleRecording(tripId)} />
          </View>
          <View style={[styles.recordingRow, { marginTop: 10 }]}>
            <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 13, flex: 1 }]}>
              Économie de batterie (échantillonnage réduit)
            </Text>
            <Switch value={batteryAware} onChange={() => toggleBatteryAware(tripId)} />
          </View>
        </View>
      ) : null}

      <View style={[styles.recapCard, { backgroundColor: theme.colors.ink }]}>
        <Text style={[typography.heroStat, { color: theme.colors.ground, fontSize: 30 }]}>{recap.distanceKm} km</Text>
        <Text style={[typography.mono, { color: "rgba(255,255,255,0.7)", marginTop: 6 }]}>
          {recap.stopCount} arrêts · {recap.countryCount} pays · {recap.dayCount} jours
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button label="Partager" variant="secondary" icon="share-outline" onPress={share} />
        </View>
        {tripStatus === "past" ? (
          <View style={{ flex: 1 }}>
            <Button label="Publier comme itinéraire" variant="secondary" icon="cloud-upload-outline" onPress={onPublish} />
          </View>
        ) : null}
      </View>

      <View style={{ gap: 14 }}>
        {entries.map((entry) => (
          <JournalEntryCard key={entry.dayIndex} entry={entry} onChangeCaption={(caption) => updateCaption(tripId, entry.dayIndex, caption)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recordingCard: { borderRadius: radius.lg, borderWidth: 1, padding: 14 },
  recordingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  recordingLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  recordingDot: { width: 8, height: 8, borderRadius: 4 },
  recapCard: { borderRadius: radius.lg, padding: 20 },
});
