import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { Chip } from "../../../../components/ui/Chip";
import { FieldGroup } from "../../../../components/ui/FieldGroup";
import { TextField } from "../../../../components/ui/TextField";
import { VehicleSilhouette } from "../../../../features/vehicle/VehicleSilhouette";
import { vehicleStepInfo } from "../../../../features/vehicle/steps";
import { useConvertedField } from "../../../../features/vehicle/useConvertedField";
import { WizardShell } from "../../../../features/wizard/WizardShell";
import { displayToKg, displayToMeters, kgToDisplay, metersToDisplay } from "../../../../lib/format";
import { useSettingsStore } from "../../../../store/settingsStore";
import { useVehiclesStore } from "../../../../store/vehiclesStore";

export default function VehicleDimensionsStep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const vehicle = useVehiclesStore((s) => s.vehicles.find((v) => v.id === id));
  const updateVehicle = useVehiclesStore((s) => s.updateVehicle);
  const units = useSettingsStore((s) => s.units);
  const setUnits = useSettingsStore((s) => s.setUnits);

  const [heightM, setHeightM] = useState(vehicle?.heightM ?? 2.7);
  const [lengthM, setLengthM] = useState(vehicle?.lengthM ?? 5.9);
  const [widthM, setWidthM] = useState(vehicle?.widthM ?? 2.05);
  const [weightKg, setWeightKg] = useState(vehicle?.weightKg ?? 3500);

  const height = useConvertedField(heightM, setHeightM, units, metersToDisplay, displayToMeters);
  const length = useConvertedField(lengthM, setLengthM, units, metersToDisplay, displayToMeters);
  const width = useConvertedField(widthM, setWidthM, units, metersToDisplay, displayToMeters);
  const weight = useConvertedField(weightKg, setWeightKg, units, kgToDisplay, displayToKg, 0);

  const { step, stepCount, nextRoute, backRoute } = vehicleStepInfo(id, "dimensions");
  const unitLabel = units === "metric" ? "m" : "ft";
  const weightUnitLabel = units === "metric" ? "kg" : "lb";

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace((backRoute ?? "/profile/vehicles") as any);
  };

  const next = async () => {
    await updateVehicle(id, { heightM, lengthM, widthM, weightKg });
    router.push((nextRoute ?? `/profile/vehicles/${id}/equipment`) as any);
  };

  if (!vehicle) return null;

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title="Gabarit"
      subtitle="Ces valeurs filtrent les itinéraires et les places compatibles sur la carte des services."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} />}
    >
      <VehicleSilhouette type={vehicle.type} heightM={heightM} lengthM={lengthM} weightKg={weightKg} unit={units} />

      <FieldGroup label="Unités">
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Chip label="Métrique" selected={units === "metric"} onPress={() => setUnits("metric")} />
          <Chip label="Impérial" selected={units === "imperial"} onPress={() => setUnits("imperial")} />
        </View>
      </FieldGroup>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <TextField label={`Hauteur (${unitLabel})`} keyboardType="decimal-pad" value={height.text} onChangeText={height.onChangeText} />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label={`Longueur (${unitLabel})`} keyboardType="decimal-pad" value={length.text} onChangeText={length.onChangeText} />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <TextField label={`Largeur (${unitLabel})`} keyboardType="decimal-pad" value={width.text} onChangeText={width.onChangeText} />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label={`Poids (${weightUnitLabel})`} keyboardType="decimal-pad" value={weight.text} onChangeText={weight.onChangeText} />
        </View>
      </View>
    </WizardShell>
  );
}
