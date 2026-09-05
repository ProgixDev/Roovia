import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { distanceKm, type Poi } from "../../mocks/pois";
import type { LatLng } from "./types";
import { PoiListRow } from "./PoiListRow";

interface NearMeSheetProps {
  visible: boolean;
  onClose: () => void;
  from: LatLng;
  pois: Poi[];
  onPressPoi: (poi: Poi) => void;
}

/**
 * No real GPS yet (see IMPLEMENTATION_PLAN.md §4/§6) — `from` is a fixed
 * mock position along the corridor, close enough to demo "what's near me
 * right now" without a location permission the prototype doesn't need.
 */
export function NearMeSheet({ visible, onClose, from, pois, onPressPoi }: NearMeSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const sorted = [...pois]
    .map((poi) => ({ poi, distance: distanceKm(from, poi.coordinate) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 12);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised, paddingBottom: insets.bottom + 20 }]}>
        <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 22 }]}>Autour de moi</Text>
        <ScrollView style={{ marginTop: 12 }} showsVerticalScrollIndicator={false}>
          {sorted.map(({ poi, distance }) => (
            <PoiListRow key={poi.id} poi={poi} distanceKm={distance} onPress={() => { onClose(); onPressPoi(poi); }} />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "75%", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20 },
});
