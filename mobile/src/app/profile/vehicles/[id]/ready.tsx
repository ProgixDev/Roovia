import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../../../components/ui/Button";
import { ListRow } from "../../../../components/ui/ListRow";
import { radius } from "../../../../constants/themes";
import { typography } from "../../../../constants/typography";
import { useTheme } from "../../../../contexts/ThemeContext";
import { FUEL_LABEL, VEHICLE_TYPE_LABEL } from "../../../../features/vehicle/labels";
import { VEHICLE_SCENE } from "../../../../features/vehicle/vehicleScenes";
import { formatLength } from "../../../../lib/format";
import { useVehiclesStore } from "../../../../store/vehiclesStore";

/** Phase 4/4 — the vehicle wizard's finish line: a summary + two exits (back to edit, or done). */
export default function VehicleReadyStep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const vehicles = useVehiclesStore((s) => s.vehicles);
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) return null;

  // "Generate my first trip" only makes sense the first time through this
  // wizard — a garage that already has other vehicles gets a plain "Done"
  // back to the garage instead of a first-vehicle-onboarding CTA that
  // wouldn't apply to a 2nd/3rd van or an edit of an existing one.
  const isOnlyVehicle = vehicles.length <= 1;

  const editVehicle = () => router.push(`/profile/vehicles/${id}/basics` as any);
  const finish = () => router.replace((isOnlyVehicle ? "/(tabs)" : "/profile/vehicles") as any);

  // Tonnes, not `formatWeight`'s kg — "3.5t" is how a van's weight class is
  // actually talked about (also matches the Basics step's own weight box).
  const typeSummary = `${VEHICLE_TYPE_LABEL[vehicle.type]} · ${(vehicle.weightKg / 1000).toFixed(1)} t`;
  const sizeSummary = `${formatLength(vehicle.heightM)} de haut · ${formatLength(vehicle.lengthM)} de long`;
  const fuelSummary =
    vehicle.fuelType === "electric" ? "Électrique" : `${FUEL_LABEL[vehicle.fuelType]} · ${vehicle.consumptionL100} L/100km`;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <View style={[styles.content, { paddingTop: 24, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: theme.colors.blaze }]} />
          ))}
        </View>
        <Text style={[typography.body, { color: theme.colors.inkMuted, textAlign: "center", marginTop: 8 }]}>
          Profil véhicule
        </Text>

        <Text style={[typography.sectionHead, { color: theme.colors.ink, textAlign: "center", marginTop: 24 }]}>
          {vehicle.name} est prêt !
        </Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, textAlign: "center", marginTop: 8 }]}>
          Roovia adapte chaque itinéraire à votre véhicule.
        </Text>

        <Image
          source={VEHICLE_SCENE[vehicle.type]}
          style={[styles.hero, { backgroundColor: theme.colors.surfaceSunken }]}
          contentFit="cover"
        />

        <View style={[styles.summary, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          <ListRow icon="car-outline" label={typeSummary} showChevron={false} />
          <Divider />
          <ListRow icon="resize-outline" label={sizeSummary} showChevron={false} />
          <Divider />
          <ListRow icon="flame-outline" label={fuelSummary} showChevron={false} />
        </View>

        <Button label="Modifier le véhicule" variant="secondary" icon="pencil-outline" onPress={editVehicle} />
        <Button
          label={isOnlyVehicle ? "Générer mon premier voyage" : "Terminé"}
          trailingIcon={isOnlyVehicle ? "arrow-forward" : undefined}
          onPress={finish}
        />

        <Text style={[typography.body, { color: theme.colors.inkMuted, textAlign: "center" }]}>
          Vous pourrez modifier {vehicle.name} à tout moment.
        </Text>
      </View>
    </View>
  );
}

function Divider() {
  const { theme } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.line }} />;
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24, gap: 16 },
  dots: { flexDirection: "row", gap: 8, alignSelf: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  hero: {
    height: 280,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginTop: 8,
  },
  summary: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 14 },
});
