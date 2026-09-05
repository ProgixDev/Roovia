import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ActionSheet, type ActionSheetAction } from "../../../../components/ui/ActionSheet";
import { Button } from "../../../../components/ui/Button";
import { Slider } from "../../../../components/ui/Slider";
import { Stepper } from "../../../../components/ui/Stepper";
import { TextField } from "../../../../components/ui/TextField";
import { radius } from "../../../../constants/themes";
import { typography } from "../../../../constants/typography";
import { useTheme } from "../../../../contexts/ThemeContext";
import { FUEL_LABEL } from "../../../../features/vehicle/labels";
import { useConvertedField } from "../../../../features/vehicle/useConvertedField";
import { PhaseWizardShell } from "../../../../features/wizard/PhaseWizardShell";
import { consumptionToDisplay, displayToConsumption, displayToLiters, litersToDisplay } from "../../../../lib/format";
import { useSettingsStore } from "../../../../store/settingsStore";
import { type FuelType, useVehiclesStore } from "../../../../store/vehiclesStore";

const VEHICLE_STEPS = ["Basique", "Équipement", "Autonomie", "Prêt"];
const FUEL_TYPES: FuelType[] = ["diesel", "petrol", "electric", "hybrid"];
const FUEL_ICON: Record<FuelType, keyof typeof Ionicons.glyphMap> = {
  diesel: "water-outline",
  petrol: "flame-outline",
  electric: "flash-outline",
  hybrid: "swap-horizontal-outline",
};

/** Phase 3/4 — fuel + water autonomy, folded in with the old "needs" step (220V hookup, dump reminder) as "Service Needs". */
export default function VehicleAutonomyStep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const vehicle = useVehiclesStore((s) => s.vehicles.find((v) => v.id === id));
  const updateVehicle = useVehiclesStore((s) => s.updateVehicle);
  const units = useSettingsStore((s) => s.units);

  const [waterCapacityL, setWaterCapacityL] = useState(vehicle?.waterCapacityL ?? 100);
  const [fuelTankL, setFuelTankL] = useState(vehicle?.fuelTankL ?? 90);
  const [fuelType, setFuelType] = useState<FuelType>(vehicle?.fuelType ?? "diesel");
  const [consumptionL100, setConsumptionL100] = useState(vehicle?.consumptionL100 ?? 9.5);
  const [fuelPickerOpen, setFuelPickerOpen] = useState(false);
  const [hookup220V, setHookup220V] = useState(vehicle?.hookup220V ?? true);
  const [needsDumpReminder, setNeedsDumpReminder] = useState(vehicle?.dumpEveryNDays !== null);
  const [dumpEveryNDays, setDumpEveryNDays] = useState(vehicle?.dumpEveryNDays ?? 4);

  const fuel = useConvertedField(fuelTankL, setFuelTankL, units, litersToDisplay, displayToLiters, 0);
  const consumption = useConvertedField(consumptionL100, setConsumptionL100, units, consumptionToDisplay, displayToConsumption, 1);
  const isElectric = fuelType === "electric";
  const volumeUnit = units === "metric" ? "L" : "gal";

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/profile/vehicles" as any);
  };

  const next = async () => {
    await updateVehicle(id, {
      waterCapacityL,
      fuelTankL,
      fuelType,
      // 0 for fully electric — keeps it out of §7's fuel-cost math instead
      // of carrying a stale combustion-era figure nobody re-checked.
      consumptionL100: isElectric ? 0 : consumptionL100,
      hookup220V,
      dumpEveryNDays: needsDumpReminder ? dumpEveryNDays : null,
    });
    router.push(`/profile/vehicles/${id}/ready` as any);
  };

  const fuelActions: ActionSheetAction[] = FUEL_TYPES.map((f) => ({
    key: f,
    label: FUEL_LABEL[f],
    icon: FUEL_ICON[f],
    onPress: () => setFuelType(f),
  }));

  if (!vehicle) return null;

  return (
    <PhaseWizardShell
      step={2}
      stepLabels={VEHICLE_STEPS}
      headerTitle="Profil véhicule"
      exitRoute="/profile/vehicles"
      title="Quelle autonomie ?"
      subtitle="Roovia planifie selon vos besoins réels."
      onBack={goBack}
      footer={<Button label="Vérifier mon véhicule" icon="car-sport-outline" onPress={next} />}
    >
      <AutonomyRow icon={<Ionicons name="flame-outline" size={20} color={theme.colors.moss} />} label="Carburant">
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Pressable
            onPress={() => setFuelPickerOpen(true)}
            style={[styles.select, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.line }]}
          >
            <Ionicons name={FUEL_ICON[fuelType]} size={16} color={theme.colors.ink} />
            <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>{FUEL_LABEL[fuelType]}</Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.inkMuted} />
          </Pressable>
          {!isElectric ? (
            <View
              style={[
                styles.select,
                { flex: 1, backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.line },
              ]}
            >
              <TextInput
                style={[typography.button, { color: theme.colors.ink, flex: 1, padding: 0 }]}
                keyboardType="decimal-pad"
                value={consumption.text}
                onChangeText={consumption.onChangeText}
              />
              <Text style={[typography.body, { color: theme.colors.inkMuted }]}>
                {units === "metric" ? "L/100km" : "mpg"}
              </Text>
            </View>
          ) : null}
        </View>
        {!isElectric ? (
          <View style={{ marginTop: 10 }}>
            <TextField
              label={`Réservoir carburant (${volumeUnit})`}
              keyboardType="decimal-pad"
              value={fuel.text}
              onChangeText={fuel.onChangeText}
            />
          </View>
        ) : null}
      </AutonomyRow>

      <AutonomyRow icon={<Ionicons name="water-outline" size={20} color={theme.colors.moss} />} label="Autonomie en eau">
        <Text style={[typography.button, { color: theme.colors.ink, marginTop: 10 }]}>
          Eau propre {litersToDisplay(waterCapacityL, units).toFixed(0)} {volumeUnit}
        </Text>
        <View style={{ marginTop: 14 }}>
          <Slider value={waterCapacityL} min={20} max={300} step={5} onChange={setWaterCapacityL} />
        </View>
      </AutonomyRow>

      <AutonomyRow icon={<MaterialCommunityIcons name="power-plug-outline" size={20} color={theme.colors.moss} />} label="Besoins de service">
        <View style={{ gap: 10, marginTop: 10 }}>
          <NeedToggle
            icon={<Ionicons name="flash-outline" size={16} color={hookup220V ? theme.colors.blazeInk : theme.colors.ink} />}
            label="Branchement 220V"
            selected={hookup220V}
            onPress={() => setHookup220V((v) => !v)}
          />
          <NeedToggle
            icon={<Ionicons name="trash-outline" size={16} color={needsDumpReminder ? theme.colors.blazeInk : theme.colors.ink} />}
            label={`Vidange tous les ${dumpEveryNDays} jours`}
            selected={needsDumpReminder}
            onPress={() => setNeedsDumpReminder((v) => !v)}
          />
        </View>

        {needsDumpReminder ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
            <Text style={[typography.body, { color: theme.colors.inkMuted }]}>Fréquence</Text>
            <Stepper value={dumpEveryNDays} min={1} max={14} onChange={setDumpEveryNDays} />
          </View>
        ) : null}
      </AutonomyRow>

      <ActionSheet
        visible={fuelPickerOpen}
        onClose={() => setFuelPickerOpen(false)}
        title="Type de carburant"
        actions={fuelActions}
      />
    </PhaseWizardShell>
  );
}

function AutonomyRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <View style={styles.rowHeader}>
        <View style={[styles.iconBadge, { backgroundColor: `${theme.colors.moss}2E` }]}>{icon}</View>
        <Text style={[typography.caption, { color: theme.colors.inkMuted, textTransform: "uppercase" }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

function NeedToggle({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.needPill,
        {
          backgroundColor: selected ? theme.colors.moss : theme.colors.surfaceSunken,
          borderColor: selected ? theme.colors.moss : theme.colors.line,
        },
      ]}
    >
      {icon}
      <Text style={[typography.button, { color: selected ? theme.colors.blazeInk : theme.colors.ink, flex: 1 }]}>
        {label}
      </Text>
      {selected ? <Ionicons name="checkmark" size={16} color={theme.colors.blazeInk} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: radius.lg, borderWidth: 1, padding: 16 },
  rowHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBadge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  select: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 54,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  needPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
