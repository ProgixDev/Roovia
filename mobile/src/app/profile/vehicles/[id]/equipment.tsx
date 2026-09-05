import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ReactNode, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { Chip } from "../../../../components/ui/Chip";
import { typography } from "../../../../constants/typography";
import { useTheme } from "../../../../contexts/ThemeContext";
import { IconToggleCard } from "../../../../features/vehicle/IconToggleCard";
import { PhaseWizardShell } from "../../../../features/wizard/PhaseWizardShell";
import { type ToiletType, type VehicleEquipment, useVehiclesStore } from "../../../../store/vehiclesStore";

const VEHICLE_STEPS = ["Basique", "Équipement", "Autonomie", "Prêt"];

/** Phase 2/4 — same fields as the old "equipment" step, now with icon cards instead of plain switch rows. */
export default function VehicleEquipmentStep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const vehicle = useVehiclesStore((s) => s.vehicles.find((v) => v.id === id));
  const updateVehicle = useVehiclesStore((s) => s.updateVehicle);

  const [toiletType, setToiletType] = useState<ToiletType>(vehicle?.toiletType ?? "none");
  const [equipment, setEquipment] = useState<VehicleEquipment>(
    vehicle?.equipment ?? {
      shower: false,
      freshWaterTank: true,
      greyTank: true,
      blackTank: false,
      solar: false,
      fridge: true,
    },
  );

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/profile/vehicles" as any);
  };

  const next = async () => {
    await updateVehicle(id, { toiletType, equipment });
    router.push(`/profile/vehicles/${id}/autonomy` as any);
  };

  const toggleEquipment = (key: keyof VehicleEquipment) =>
    setEquipment((prev) => ({ ...prev, [key]: !prev[key] }));

  const hasToilet = toiletType !== "none";
  const toggleToilet = () => setToiletType(hasToilet ? "none" : "cassette");

  if (!vehicle) return null;

  return (
    <PhaseWizardShell
      step={1}
      stepLabels={VEHICLE_STEPS}
      headerTitle="Profil véhicule"
      exitRoute="/profile/vehicles"
      title="Qu'y a-t-il à bord ?"
      subtitle="On trouvera les bonnes étapes en cours de route."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} />}
    >
      <View style={{ gap: 14 }}>
        <SectionHeader icon={<Ionicons name="leaf-outline" size={16} color={theme.colors.moss} />} label="Confort" />
        <View style={styles.grid}>
          <IconToggleCard
            icon={<MaterialCommunityIcons name="toilet" size={26} color={theme.colors.ink} />}
            label="Toilettes"
            selected={hasToilet}
            onPress={toggleToilet}
          />
          <IconToggleCard
            icon={<MaterialCommunityIcons name="shower" size={26} color={theme.colors.ink} />}
            label="Douche"
            selected={equipment.shower}
            onPress={() => toggleEquipment("shower")}
          />
          <IconToggleCard
            icon={<MaterialCommunityIcons name="fridge-outline" size={26} color={theme.colors.ink} />}
            label="Frigo"
            selected={equipment.fridge}
            onPress={() => toggleEquipment("fridge")}
          />
          <IconToggleCard
            icon={<MaterialCommunityIcons name="solar-power" size={26} color={theme.colors.ink} />}
            label="Solaire"
            selected={equipment.solar}
            onPress={() => toggleEquipment("solar")}
          />
        </View>

        {hasToilet ? (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Chip label="Cassette" selected={toiletType === "cassette"} onPress={() => setToiletType("cassette")} />
            <Chip label="Fixe" selected={toiletType === "fixed"} onPress={() => setToiletType("fixed")} />
          </View>
        ) : null}
      </View>

      <View style={{ gap: 14 }}>
        <SectionHeader icon={<Ionicons name="water-outline" size={16} color={theme.colors.moss} />} label="Eau & réservoirs" />
        <View style={styles.grid}>
          <IconToggleCard
            icon={<Ionicons name="water-outline" size={26} color={theme.colors.ink} />}
            label="Eau propre"
            selected={equipment.freshWaterTank}
            onPress={() => toggleEquipment("freshWaterTank")}
          />
          <IconToggleCard
            icon={<Ionicons name="water-outline" size={26} color={theme.colors.ink} />}
            label="Eaux grises"
            selected={equipment.greyTank}
            onPress={() => toggleEquipment("greyTank")}
          />
          <IconToggleCard
            icon={<Ionicons name="water-outline" size={26} color={theme.colors.ink} />}
            label="Eaux noires"
            selected={equipment.blackTank}
            onPress={() => toggleEquipment("blackTank")}
          />
        </View>
      </View>
    </PhaseWizardShell>
  );
}

function SectionHeader({ icon, label }: { icon: ReactNode; label: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 20, lineHeight: 22, textTransform: "uppercase" }]}>
        {label}
      </Text>
      <View style={[styles.sectionRule, { backgroundColor: theme.colors.line }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionRule: { flex: 1, height: StyleSheet.hairlineWidth },
});
