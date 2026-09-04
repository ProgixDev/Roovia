import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { TextField } from "../../../../components/ui/TextField";
import { radius } from "../../../../constants/themes";
import { typography } from "../../../../constants/typography";
import { useTheme } from "../../../../contexts/ThemeContext";
import { VehicleSilhouette } from "../../../../features/vehicle/VehicleSilhouette";
import { VEHICLE_TYPE_LABEL } from "../../../../features/vehicle/labels";
import { vehicleStepInfo } from "../../../../features/vehicle/steps";
import { WizardShell } from "../../../../features/wizard/WizardShell";
import { createVehicle, TYPE_DEFAULTS, type VehicleType, useVehiclesStore } from "../../../../store/vehiclesStore";

const TYPES: VehicleType[] = ["van", "fourgon", "camping_car", "heavy_truck", "converted_car"];

export default function VehicleTypeStep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const isNew = id === "new";
  const vehicle = useVehiclesStore((s) => s.vehicles.find((v) => v.id === id));
  const addVehicle = useVehiclesStore((s) => s.addVehicle);
  const updateVehicle = useVehiclesStore((s) => s.updateVehicle);

  const [type, setType] = useState<VehicleType>(vehicle?.type ?? "van");
  const [name, setName] = useState(vehicle?.name ?? "");
  const { step, stepCount, backRoute } = vehicleStepInfo(id, "type");

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace((backRoute ?? "/profile/vehicles") as any);
  };

  const next = async () => {
    if (isNew) {
      const created = createVehicle({ type, name: name.trim() || VEHICLE_TYPE_LABEL[type] });
      await addVehicle(created);
      // `replace`, not `push` — this drops the "new" draft screen from the
      // stack, so a later back-from-dimensions lands on the garage instead
      // of a stale create-screen that would mint a second vehicle if
      // "Continuer" were pressed again.
      router.replace(`/profile/vehicles/${created.id}/dimensions` as any);
    } else {
      await updateVehicle(id, { type, name: name.trim() || VEHICLE_TYPE_LABEL[type] });
      router.push(`/profile/vehicles/${id}/dimensions` as any);
    }
  };

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title={isNew ? "Quel véhicule ?" : "Modifier le véhicule"}
      subtitle="La silhouette et les contraintes de gabarit s'ajustent selon le type."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} />}
    >
      <VehicleSilhouette
        type={type}
        heightM={vehicle?.heightM ?? TYPE_DEFAULTS[type].heightM}
        lengthM={vehicle?.lengthM ?? TYPE_DEFAULTS[type].lengthM}
        weightKg={vehicle?.weightKg ?? TYPE_DEFAULTS[type].weightKg}
        unit="metric"
      />

      <View style={styles.grid}>
        {TYPES.map((t) => {
          const selected = type === t;
          return (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? theme.colors.blaze : theme.colors.surface,
                  borderColor: selected ? theme.colors.blaze : theme.colors.line,
                },
              ]}
            >
              <Text style={[typography.button, { color: selected ? theme.colors.blazeInk : theme.colors.ink }]}>
                {VEHICLE_TYPE_LABEL[t]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextField label="Nom du véhicule" placeholder="Notre van, Le Ducato…" value={name} onChangeText={setName} />
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 10 },
  option: { height: 52, borderRadius: radius.md, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
