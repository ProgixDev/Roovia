import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../constants/fonts";
import { kidsTheme, KIDS_MIN_TARGET } from "../../constants/kidsTheme";
import { interpolateAlongRoute } from "../map/useMapRegion";
import { factsFor } from "../../mocks/kidsFacts";
import { useKidsStore } from "../../store/kidsStore";
import { useTravelerProfileStore } from "../../store/travelerProfileStore";
import { useTripsStore } from "../../store/tripsStore";
import { useItineraryStore } from "../../store/itineraryStore";
import { FactCard } from "./FactCard";
import { KidsLiveMap } from "./KidsLiveMap";
import { ParentalGate } from "./ParentalGate";
import { UpcomingStopCard } from "./UpcomingStopCard";

const KNOWN_REGIONS = ["Espagne", "France", "Portugal"];

function regionFor(destination: string): string {
  return KNOWN_REGIONS.find((r) => destination.toLowerCase().includes(r.toLowerCase())) ?? "France";
}

export default function KidsHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const exitKidsMode = useKidsStore((s) => s.exitKidsMode);
  const [exitGateOpen, setExitGateOpen] = useState(false);

  const trips = useTripsStore((s) => s.trips);
  const itineraries = useItineraryStore((s) => s.itineraries);
  const profile = useTravelerProfileStore((s) => s.profile);

  const activeTrip = trips.find((t) => t.status === "in_progress") ?? trips.find((t) => t.status === "upcoming") ?? null;
  const itinerary = activeTrip ? itineraries[activeTrip.id] : undefined;
  const activeVersion = itinerary?.versions.find((v) => v.id === itinerary.activeVersionId);
  const days = activeVersion?.days ?? [];
  const allStops = days.flatMap((d) => d.stops);
  const routeCoordinates = allStops.map((s) => s.coordinate);
  const progress = activeTrip?.dayProgress ? activeTrip.dayProgress.current / activeTrip.dayProgress.total : 0.3;
  const position = routeCoordinates.length > 0 ? interpolateAlongRoute(routeCoordinates, progress) : null;
  const upcomingStops = allStops.slice(0, 5);

  const region = activeTrip ? regionFor(activeTrip.destination) : "France";
  const ages = profile.children.length > 0 ? profile.children.map((c) => c.age) : [8];
  const facts = Array.from(new Map(ages.flatMap((age) => factsFor(region, age)).map((f) => [f.id, f])).values());

  const exit = () => {
    exitKidsMode();
    router.replace("/(tabs)/profil" as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: kidsTheme.background }}>
      {/* Not `insets.top` — the root layout's own SafeAreaView already reserves it for every non-full-bleed route. */}
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 20, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Mon aventure</Text>
          <Pressable onPress={() => setExitGateOpen(true)} style={styles.exitButton}>
            <Text style={styles.exitText}>Sortir</Text>
          </Pressable>
        </View>

        <View style={isTablet ? styles.tabletRow : undefined}>
          <View style={isTablet ? styles.tabletColumn : undefined}>
            <KidsLiveMap position={position} routeCoordinates={routeCoordinates} progress={progress} />

            {upcomingStops.length > 0 ? (
              <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Prochaines découvertes</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingTop: 12 }}>
                  {upcomingStops.map((stop) => (
                    <UpcomingStopCard key={stop.id} stop={stop} />
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>

          <View style={isTablet ? styles.tabletColumn : { marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Le savais-tu ?</Text>
            <View style={{ gap: 12, marginTop: 12 }}>
              {facts.map((fact) => (
                <FactCard key={fact.id} fact={fact} />
              ))}
            </View>

            <Pressable onPress={() => router.push(`/kids/quiz?region=${region}` as any)} style={styles.quizButton}>
              <Text style={styles.quizButtonText}>Faire le quiz de la région 🎉</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ParentalGate visible={exitGateOpen} onClose={() => setExitGateOpen(false)} onSuccess={() => { setExitGateOpen(false); exit(); }} title="Quitter le mode enfant ?" />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: fonts.displayBlack, fontSize: 32, color: kidsTheme.ink },
  exitButton: { height: 44, paddingHorizontal: 18, borderRadius: 999, backgroundColor: kidsTheme.surface, borderWidth: 2, borderColor: kidsTheme.line, alignItems: "center", justifyContent: "center" },
  exitText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: kidsTheme.inkMuted },
  sectionTitle: { fontFamily: fonts.displayBlack, fontSize: 22, color: kidsTheme.ink, marginTop: 8 },
  tabletRow: { flexDirection: "row", gap: 24 },
  tabletColumn: { flex: 1 },
  quizButton: {
    marginTop: 20,
    height: KIDS_MIN_TARGET,
    borderRadius: 999,
    backgroundColor: kidsTheme.sun,
    alignItems: "center",
    justifyContent: "center",
  },
  quizButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: kidsTheme.ink },
});
