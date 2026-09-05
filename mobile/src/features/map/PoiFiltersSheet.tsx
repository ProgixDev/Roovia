import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { Stepper } from "../../components/ui/Stepper";
import { Switch } from "../../components/ui/Switch";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { usePoiStore } from "../../store/poiStore";

interface PoiFiltersSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function PoiFiltersSheet({ visible, onClose }: PoiFiltersSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const filters = usePoiStore((s) => s.filters);
  const setFilters = usePoiStore((s) => s.setFilters);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised, paddingBottom: insets.bottom + 20 }]}>
        <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 22 }]}>Filtres</Text>

        <View style={styles.row}>
          <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>Gratuit uniquement</Text>
          <Switch value={filters.freeOnly} onChange={(v) => setFilters({ freeOnly: v })} />
        </View>
        <View style={styles.row}>
          <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>Ouvert maintenant</Text>
          <Switch value={filters.openNowOnly} onChange={(v) => setFilters({ openNowOnly: v })} />
        </View>
        <View style={styles.row}>
          <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>Compatible avec mon véhicule</Text>
          <Switch value={filters.fitsVehicle} onChange={(v) => setFilters({ fitsVehicle: v })} />
        </View>
        <View style={styles.row}>
          <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>Note minimum</Text>
          <Stepper value={filters.minRating} min={0} max={5} onChange={(v) => setFilters({ minRating: v })} />
        </View>

        <View style={{ marginTop: 20 }}>
          <Button label="Appliquer" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, gap: 18 },
  row: { flexDirection: "row", alignItems: "center", height: 40 },
});
