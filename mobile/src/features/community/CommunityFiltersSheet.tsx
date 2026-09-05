import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Season } from "../../mocks/community";
import { VEHICLE_TYPE_LABEL } from "../vehicle/labels";
import type { VehicleType } from "../../store/vehiclesStore";

export interface CommunityFilters {
  country: string | null;
  durationBucket: "short" | "medium" | "long" | null;
  budgetBucket: "low" | "mid" | "high" | null;
  vehicleType: VehicleType | null;
  season: Season | null;
}

export const EMPTY_FILTERS: CommunityFilters = { country: null, durationBucket: null, budgetBucket: null, vehicleType: null, season: null };

const SEASON_LABEL: Record<Season, string> = { printemps: "Printemps", ete: "Été", automne: "Automne", hiver: "Hiver" };
const VEHICLES: VehicleType[] = ["van", "fourgon", "camping_car", "heavy_truck", "converted_car"];

interface CommunityFiltersSheetProps {
  visible: boolean;
  onClose: () => void;
  countries: string[];
  filters: CommunityFilters;
  onChange: (filters: CommunityFilters) => void;
}

export function CommunityFiltersSheet({ visible, onClose, countries, filters, onChange }: CommunityFiltersSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const set = <K extends keyof CommunityFilters>(key: K, value: CommunityFilters[K]) =>
    onChange({ ...filters, [key]: filters[key] === value ? null : value });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised, paddingBottom: insets.bottom + 20 }]}>
        <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 22 }]}>Filtres</Text>
        <ScrollView style={{ marginTop: 16 }} contentContainerStyle={{ gap: 20 }}>
          <FieldGroup label="Pays">
            <View style={styles.row}>
              {countries.map((c) => (
                <Chip key={c} label={c} selected={filters.country === c} onPress={() => set("country", c)} />
              ))}
            </View>
          </FieldGroup>

          <FieldGroup label="Durée">
            <View style={styles.row}>
              <Chip label="≤ 5 jours" selected={filters.durationBucket === "short"} onPress={() => set("durationBucket", "short")} />
              <Chip label="6-10 jours" selected={filters.durationBucket === "medium"} onPress={() => set("durationBucket", "medium")} />
              <Chip label="11+ jours" selected={filters.durationBucket === "long"} onPress={() => set("durationBucket", "long")} />
            </View>
          </FieldGroup>

          <FieldGroup label="Budget">
            <View style={styles.row}>
              <Chip label="≤ 500 €" selected={filters.budgetBucket === "low"} onPress={() => set("budgetBucket", "low")} />
              <Chip label="500-1000 €" selected={filters.budgetBucket === "mid"} onPress={() => set("budgetBucket", "mid")} />
              <Chip label="1000 €+" selected={filters.budgetBucket === "high"} onPress={() => set("budgetBucket", "high")} />
            </View>
          </FieldGroup>

          <FieldGroup label="Véhicule">
            <View style={styles.row}>
              {VEHICLES.map((v) => (
                <Chip key={v} label={VEHICLE_TYPE_LABEL[v]} selected={filters.vehicleType === v} onPress={() => set("vehicleType", v)} />
              ))}
            </View>
          </FieldGroup>

          <FieldGroup label="Saison">
            <View style={styles.row}>
              {(Object.keys(SEASON_LABEL) as Season[]).map((s) => (
                <Chip key={s} label={SEASON_LABEL[s]} selected={filters.season === s} onPress={() => set("season", s)} />
              ))}
            </View>
          </FieldGroup>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button label="Réinitialiser" variant="secondary" onPress={() => onChange(EMPTY_FILTERS)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Appliquer" onPress={onClose} />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "85%", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
