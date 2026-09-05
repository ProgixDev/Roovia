import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { radius } from "../../constants/themes";
import { useTheme } from "../../contexts/ThemeContext";
import { fits } from "../../lib/vehicleFit";
import { PLACES } from "../../mocks/places";
import { POIS, type Poi } from "../../mocks/pois";
import type { Stop, StopKind } from "../../mocks/itineraries";
import { useItineraryStore } from "../../store/itineraryStore";
import { usePoiStore } from "../../store/poiStore";
import { useTripsStore } from "../../store/tripsStore";
import { useVehiclesStore } from "../../store/vehiclesStore";
import { LayerToggleRow } from "./LayerToggleRow";
import { NearMeSheet } from "./NearMeSheet";
import { PoiDetailSheet } from "./PoiDetailSheet";
import { PoiFiltersSheet } from "./PoiFiltersSheet";
import { RooviaMap } from "./RooviaMap";
import { SubmitPoiSheet } from "./SubmitPoiSheet";
import type { MapPinData } from "./types";

const MOCK_CURRENT_POSITION = PLACES.find((p) => p.id === "es-san-sebastian")!.coordinate;

function poiToStopKind(poi: Poi): StopKind {
  if (poi.kind === "bivouac") return "sleep_free";
  if (poi.kind === "campsite") return "sleep_paid";
  if (poi.kind === "viewpoint" || poi.kind === "market") return "visit";
  return "service";
}

export default function ServicesMapScreen() {
  const { theme } = useTheme();
  const visibleKinds = usePoiStore((s) => s.visibleKinds);
  const filters = usePoiStore((s) => s.filters);
  const submittedPois = usePoiStore((s) => s.submitted);
  const submitPoi = usePoiStore((s) => s.submit);
  const activeVehicle = useVehiclesStore((s) => s.vehicles.find((v) => v.id === s.activeId)) ?? null;
  const trips = useTripsStore((s) => s.trips);
  const itineraries = useItineraryStore((s) => s.itineraries);
  const addStop = useItineraryStore((s) => s.addStop);

  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nearMeOpen, setNearMeOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const allPois = [...POIS, ...submittedPois];
  const filteredPois = allPois.filter((poi) => {
    if (!visibleKinds.includes(poi.kind)) return false;
    if (filters.freeOnly && poi.priceEur !== null && poi.priceEur > 0) return false;
    if (filters.openNowOnly && !poi.openNow) return false;
    if (filters.minRating > 0 && poi.ratingOutOf5 < filters.minRating) return false;
    if (filters.fitsVehicle && activeVehicle && poi.maxHeightM !== undefined) {
      if (!fits(activeVehicle, { maxHeightM: poi.maxHeightM })) return false;
    }
    return true;
  });

  const pins: MapPinData[] = filteredPois.map((poi) => ({ id: poi.id, kind: poi.kind, coordinate: poi.coordinate }));

  const addToActiveTrip = (poi: Poi) => {
    const targetTrip = trips.find((t) => t.status === "in_progress") ?? trips.find((t) => t.status === "upcoming");
    if (!targetTrip) {
      Alert.alert("Aucun voyage actif", "Générez ou démarrez un voyage pour pouvoir y ajouter ce lieu.");
      return;
    }
    const itinerary = itineraries[targetTrip.id];
    const activeVersion = itinerary?.versions.find((v) => v.id === itinerary.activeVersionId);
    const firstDay = activeVersion?.days[0];
    if (!firstDay) {
      Alert.alert("Itinéraire indisponible", "Ce voyage n'a pas encore d'itinéraire détaillé.");
      return;
    }
    const stop: Stop = {
      id: `stop_poi_${poi.id}_${Date.now()}`,
      name: poi.name,
      kind: poiToStopKind(poi),
      description: poi.description,
      coordinate: poi.coordinate,
      driveTimeMinFromPrev: null,
      priceEur: poi.priceEur,
    };
    addStop(targetTrip.id, firstDay.id, stop);
    setSelectedPoi(null);
    Alert.alert("Ajouté", `${poi.name} a été ajouté à « ${targetTrip.title} ».`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
      <View style={styles.toolbar}>
        <LayerToggleRow />
      </View>

      <View style={{ flex: 1 }}>
        <RooviaMap pins={pins} onPressPin={(id) => setSelectedPoi(allPois.find((p) => p.id === id) ?? null)} style={{ flex: 1 }} />

        <Pressable onPress={() => setSubmitOpen(true)} style={[styles.fab, styles.fabSubmit, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          <Ionicons name="add-outline" size={22} color={theme.colors.ink} />
        </Pressable>
        <Pressable onPress={() => setFiltersOpen(true)} style={[styles.fab, styles.fabFilters, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          <Ionicons name="options-outline" size={20} color={theme.colors.ink} />
        </Pressable>
        <Pressable onPress={() => setNearMeOpen(true)} style={[styles.fab, styles.fabNearMe, { backgroundColor: theme.colors.blaze }]}>
          <Ionicons name="locate" size={20} color={theme.colors.blazeInk} />
        </Pressable>
      </View>

      <PoiFiltersSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <NearMeSheet
        visible={nearMeOpen}
        onClose={() => setNearMeOpen(false)}
        from={MOCK_CURRENT_POSITION}
        pois={filteredPois}
        onPressPoi={setSelectedPoi}
      />
      <PoiDetailSheet poi={selectedPoi} onClose={() => setSelectedPoi(null)} onAddToTrip={() => selectedPoi && addToActiveTrip(selectedPoi)} />
      <SubmitPoiSheet visible={submitOpen} onClose={() => setSubmitOpen(false)} position={MOCK_CURRENT_POSITION} onSubmit={submitPoi} />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { paddingHorizontal: 20, paddingBottom: 12 },
  fab: { position: "absolute", width: 48, height: 48, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  fabSubmit: { right: 16, bottom: 136, borderWidth: 1 },
  fabFilters: { right: 16, bottom: 76, borderWidth: 1 },
  fabNearMe: { right: 16, bottom: 16 },
});
