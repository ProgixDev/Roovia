import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { Chip } from "../../../../components/ui/Chip";
import { FieldGroup } from "../../../../components/ui/FieldGroup";
import { TextField } from "../../../../components/ui/TextField";
import { radius } from "../../../../constants/themes";
import { typography } from "../../../../constants/typography";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useConvertedField } from "../../../../features/vehicle/useConvertedField";
import { VehicleTypePicker } from "../../../../features/vehicle/VehicleTypePicker";
import { VEHICLE_TYPE_LABEL } from "../../../../features/vehicle/labels";
import { PhaseWizardShell } from "../../../../features/wizard/PhaseWizardShell";
import { displayToKg, displayToMeters, kgToDisplay, metersToDisplay, type UnitSystem } from "../../../../lib/format";
import { useSettingsStore } from "../../../../store/settingsStore";
import { createVehicle, TYPE_DEFAULTS, type VehicleType, useVehiclesStore } from "../../../../store/vehiclesStore";

const VEHICLE_STEPS = ["Basique", "Équipement", "Autonomie", "Prêt"];

function weightToDisplay(kg: number, units: UnitSystem): number {
  return units === "imperial" ? kgToDisplay(kg, units) : kg / 1000;
}
function displayToWeight(value: number, units: UnitSystem): number {
  return units === "imperial" ? displayToKg(value, units) : value * 1000;
}

/** Phase 1/4 — merges the old "type" and "dimensions" steps: what it is, its name, and its gabarit, all in one place. */
export default function VehicleBasicsStep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";
  const vehicle = useVehiclesStore((s) => s.vehicles.find((v) => v.id === id));
  const addVehicle = useVehiclesStore((s) => s.addVehicle);
  const updateVehicle = useVehiclesStore((s) => s.updateVehicle);
  const units = useSettingsStore((s) => s.units);
  const setUnits = useSettingsStore((s) => s.setUnits);

  const [type, setType] = useState<VehicleType>(vehicle?.type ?? "van");
  const [name, setName] = useState(vehicle?.name ?? "");
  const [heightM, setHeightM] = useState(vehicle?.heightM ?? TYPE_DEFAULTS[type].heightM);
  const [lengthM, setLengthM] = useState(vehicle?.lengthM ?? TYPE_DEFAULTS[type].lengthM);
  const [widthM, setWidthM] = useState(vehicle?.widthM ?? TYPE_DEFAULTS[type].widthM);
  const [weightKg, setWeightKg] = useState(vehicle?.weightKg ?? TYPE_DEFAULTS[type].weightKg);

  // Switching type re-seeds dimensions from that type's defaults — same as
  // the old `type.tsx` → `dimensions.tsx` hand-off, just without a screen
  // change in between. Only overwrites fields the user hasn't already
  // customized this session would be nicer, but the old flow didn't do
  // that either (a fresh `dimensions.tsx` mount always started from the
  // new type's defaults too), so this isn't a regression.
  const changeType = (t: VehicleType) => {
    setType(t);
    setHeightM(TYPE_DEFAULTS[t].heightM);
    setLengthM(TYPE_DEFAULTS[t].lengthM);
    setWidthM(TYPE_DEFAULTS[t].widthM);
    setWeightKg(TYPE_DEFAULTS[t].weightKg);
  };

  const height = useConvertedField(heightM, setHeightM, units, metersToDisplay, displayToMeters);
  const length = useConvertedField(lengthM, setLengthM, units, metersToDisplay, displayToMeters);
  const width = useConvertedField(widthM, setWidthM, units, metersToDisplay, displayToMeters);
  // `kgToDisplay` only converts kg↔lb — metric stays raw kilograms, which
  // this screen shows as tonnes instead (matching how a van's weight class
  // is actually talked about, "3.5t"), so it needs its own tonne-aware
  // conversion rather than the shared kg/lb pair every other kg field uses.
  const weight = useConvertedField(weightKg, setWeightKg, units, weightToDisplay, displayToWeight, 1);
  const lengthUnit = units === "metric" ? "m" : "ft";
  const weightUnit = units === "metric" ? "t" : "lb";

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/profile/vehicles" as any);
  };

  const next = async () => {
    const patch = { type, name: name.trim() || VEHICLE_TYPE_LABEL[type], heightM, lengthM, widthM, weightKg };
    if (isNew) {
      const created = createVehicle(patch);
      await addVehicle(created);
      // `replace`, not `push` — drops the "new" draft screen from the
      // stack, so a later back-from-equipment lands on the garage instead
      // of a stale create-screen that would mint a second vehicle if
      // "Continuer" were pressed again.
      router.replace(`/profile/vehicles/${created.id}/equipment` as any);
    } else {
      await updateVehicle(id, patch);
      router.push(`/profile/vehicles/${id}/equipment` as any);
    }
  };

  return (
    <PhaseWizardShell
      step={0}
      stepLabels={VEHICLE_STEPS}
      headerTitle="Profil véhicule"
      exitRoute="/profile/vehicles"
      onBack={goBack}
      title="Quel véhicule ?"
      subtitle="Votre véhicule garde chaque itinéraire réaliste."
      footer={<Button label="Continuer" onPress={next} />}
    >
      <VehicleTypePicker value={type} onChange={changeType} />

      <TextField label="Donnez-lui un nom" placeholder="Milo, Le Ducato…" value={name} onChangeText={setName} />

      <FieldGroup label="Gabarit du véhicule">
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <Chip label="Métrique" selected={units === "metric"} onPress={() => setUnits("metric")} />
          <Chip label="Impérial" selected={units === "imperial"} onPress={() => setUnits("imperial")} />
        </View>
        <View style={styles.grid}>
          <DimensionBox label="Hauteur" unit={lengthUnit} value={height.text} onChangeText={height.onChangeText} />
          <DimensionBox label="Longueur" unit={lengthUnit} value={length.text} onChangeText={length.onChangeText} />
          <DimensionBox label="Largeur" unit={lengthUnit} value={width.text} onChangeText={width.onChangeText} />
          <DimensionBox label="Poids" unit={weightUnit} value={weight.text} onChangeText={weight.onChangeText} />
        </View>
      </FieldGroup>
    </PhaseWizardShell>
  );
}

function DimensionBox({
  label,
  unit,
  value,
  onChangeText,
}: {
  label: string;
  unit: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
        <TextInput
          style={[typography.cardTitle, { color: theme.colors.ink, padding: 0, minWidth: 30 }]}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeText}
        />
        <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  box: { flexGrow: 1, flexBasis: "45%", borderRadius: radius.md, borderWidth: 1, padding: 12, gap: 4 },
});
