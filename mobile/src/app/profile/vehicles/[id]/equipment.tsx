import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { Chip } from "../../../../components/ui/Chip";
import { FieldGroup } from "../../../../components/ui/FieldGroup";
import { Switch } from "../../../../components/ui/Switch";
import { radius } from "../../../../constants/themes";
import { typography } from "../../../../constants/typography";
import { useTheme } from "../../../../contexts/ThemeContext";
import { TOILET_LABEL } from "../../../../features/vehicle/labels";
import { vehicleStepInfo } from "../../../../features/vehicle/steps";
import { WizardShell } from "../../../../features/wizard/WizardShell";
import { type ToiletType, type VehicleEquipment, useVehiclesStore } from "../../../../store/vehiclesStore";

const TOILET_TYPES: ToiletType[] = ["cassette", "fixed", "none"];

const EQUIPMENT_ROWS: { key: keyof VehicleEquipment; label: string }[] = [
  { key: "shower", label: "Douche" },
  { key: "freshWaterTank", label: "Réservoir d'eau propre" },
  { key: "greyTank", label: "Eaux grises" },
  { key: "blackTank", label: "Eaux noires" },
  { key: "solar", label: "Panneau solaire" },
  { key: "fridge", label: "Frigo" },
];

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

  const { step, stepCount, nextRoute, backRoute } = vehicleStepInfo(id, "equipment");

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace((backRoute ?? "/profile/vehicles") as any);
  };

  const next = async () => {
    await updateVehicle(id, { toiletType, equipment });
    router.push((nextRoute ?? `/profile/vehicles/${id}/autonomy`) as any);
  };

  if (!vehicle) return null;

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title="Équipements"
      subtitle="La carte des services (POI) filtrera selon ce qui est déjà à bord."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} />}
    >
      <FieldGroup label="Toilettes">
        <View style={{ flexDirection: "row", gap: 10 }}>
          {TOILET_TYPES.map((t) => (
            <Chip key={t} label={TOILET_LABEL[t]} selected={toiletType === t} onPress={() => setToiletType(t)} />
          ))}
        </View>
      </FieldGroup>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
        {EQUIPMENT_ROWS.map((row, i) => (
          <View key={row.key}>
            <View style={styles.row}>
              <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>{row.label}</Text>
              <Switch
                value={equipment[row.key]}
                onChange={(value) => setEquipment((prev) => ({ ...prev, [row.key]: value }))}
              />
            </View>
            {i < EQUIPMENT_ROWS.length - 1 ? (
              <View style={[styles.divider, { backgroundColor: theme.colors.line }]} />
            ) : null}
          </View>
        ))}
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", height: 56 },
  divider: { height: StyleSheet.hairlineWidth },
});
