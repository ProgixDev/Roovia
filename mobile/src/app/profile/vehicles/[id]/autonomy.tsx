import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { Chip } from "../../../../components/ui/Chip";
import { FieldGroup } from "../../../../components/ui/FieldGroup";
import { TextField } from "../../../../components/ui/TextField";
import { FUEL_LABEL } from "../../../../features/vehicle/labels";
import { vehicleStepInfo } from "../../../../features/vehicle/steps";
import { useConvertedField } from "../../../../features/vehicle/useConvertedField";
import { WizardShell } from "../../../../features/wizard/WizardShell";
import { consumptionToDisplay, displayToConsumption, displayToLiters, litersToDisplay } from "../../../../lib/format";
import { useSettingsStore } from "../../../../store/settingsStore";
import { type FuelType, useVehiclesStore } from "../../../../store/vehiclesStore";

const FUEL_TYPES: FuelType[] = ["diesel", "petrol", "electric", "hybrid"];

export default function VehicleAutonomyStep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const vehicle = useVehiclesStore((s) => s.vehicles.find((v) => v.id === id));
  const updateVehicle = useVehiclesStore((s) => s.updateVehicle);
  const units = useSettingsStore((s) => s.units);

  const [waterCapacityL, setWaterCapacityL] = useState(vehicle?.waterCapacityL ?? 100);
  const [fuelTankL, setFuelTankL] = useState(vehicle?.fuelTankL ?? 90);
  const [fuelType, setFuelType] = useState<FuelType>(vehicle?.fuelType ?? "diesel");
  const [consumptionL100, setConsumptionL100] = useState(vehicle?.consumptionL100 ?? 9.5);

  const water = useConvertedField(waterCapacityL, setWaterCapacityL, units, litersToDisplay, displayToLiters, 0);
  const fuel = useConvertedField(fuelTankL, setFuelTankL, units, litersToDisplay, displayToLiters, 0);
  const consumption = useConvertedField(consumptionL100, setConsumptionL100, units, consumptionToDisplay, displayToConsumption, 1);

  const isElectric = fuelType === "electric";
  const { step, stepCount, nextRoute, backRoute } = vehicleStepInfo(id, "autonomy");
  const volumeUnit = units === "metric" ? "L" : "gal";

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace((backRoute ?? "/profile/vehicles") as any);
  };

  const next = async () => {
    // 0 for fully electric — keeps it out of §7's fuel-cost math instead of
    // carrying a stale combustion-era figure nobody re-checked.
    await updateVehicle(id, { waterCapacityL, fuelTankL, fuelType, consumptionL100: isElectric ? 0 : consumptionL100 });
    router.push((nextRoute ?? `/profile/vehicles/${id}/needs`) as any);
  };

  if (!vehicle) return null;

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title="Autonomie"
      subtitle="Ce qui déclenche les rappels de vidange, ravitaillement et point d'eau en cours de route."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} />}
    >
      <FieldGroup label="Carburant">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {FUEL_TYPES.map((f) => (
            <Chip key={f} label={FUEL_LABEL[f]} selected={fuelType === f} onPress={() => setFuelType(f)} />
          ))}
        </View>
      </FieldGroup>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <TextField
            label={`Réservoir d'eau (${volumeUnit})`}
            keyboardType="decimal-pad"
            value={water.text}
            onChangeText={water.onChangeText}
          />
        </View>
        {!isElectric ? (
          <View style={{ flex: 1 }}>
            <TextField
              label={`Réservoir carburant (${volumeUnit})`}
              keyboardType="decimal-pad"
              value={fuel.text}
              onChangeText={fuel.onChangeText}
            />
          </View>
        ) : null}
      </View>

      {!isElectric ? (
        <TextField
          label={`Consommation (${units === "metric" ? "L/100km" : "mpg"})`}
          keyboardType="decimal-pad"
          value={consumption.text}
          onChangeText={consumption.onChangeText}
        />
      ) : null}
    </WizardShell>
  );
}
