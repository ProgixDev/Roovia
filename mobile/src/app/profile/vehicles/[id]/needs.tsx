import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { FieldGroup } from "../../../../components/ui/FieldGroup";
import { Stepper } from "../../../../components/ui/Stepper";
import { Switch } from "../../../../components/ui/Switch";
import { radius } from "../../../../constants/themes";
import { typography } from "../../../../constants/typography";
import { useTheme } from "../../../../contexts/ThemeContext";
import { vehicleStepInfo } from "../../../../features/vehicle/steps";
import { WizardShell } from "../../../../features/wizard/WizardShell";
import { useVehiclesStore } from "../../../../store/vehiclesStore";

export default function VehicleNeedsStep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const vehicle = useVehiclesStore((s) => s.vehicles.find((v) => v.id === id));
  const updateVehicle = useVehiclesStore((s) => s.updateVehicle);

  const [hookup220V, setHookup220V] = useState(vehicle?.hookup220V ?? true);
  const [needsDumpReminder, setNeedsDumpReminder] = useState(vehicle?.dumpEveryNDays !== null);
  const [dumpEveryNDays, setDumpEveryNDays] = useState(vehicle?.dumpEveryNDays ?? 4);

  const { step, stepCount, backRoute } = vehicleStepInfo(id, "needs");

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace((backRoute ?? "/profile/vehicles") as any);
  };

  const finish = async () => {
    await updateVehicle(id, { hookup220V, dumpEveryNDays: needsDumpReminder ? dumpEveryNDays : null });
    router.replace("/profile/vehicles" as any);
  };

  if (!vehicle) return null;

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title="Derniers besoins"
      subtitle="Dernière étape — ces détails affinent les suggestions d'étapes en cours de route."
      onBack={goBack}
      footer={<Button label="Terminer" onPress={finish} />}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
        <View style={styles.row}>
          <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>Branchement 220V</Text>
          <Switch value={hookup220V} onChange={setHookup220V} />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.line }]} />
        <View style={styles.row}>
          <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>Rappel de vidange</Text>
          <Switch value={needsDumpReminder} onChange={setNeedsDumpReminder} />
        </View>
      </View>

      {needsDumpReminder ? (
        <FieldGroup label="Vidanger tous les">
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={[typography.body, { color: theme.colors.ink }]}>{dumpEveryNDays} jours</Text>
            <Stepper value={dumpEveryNDays} min={1} max={14} onChange={setDumpEveryNDays} />
          </View>
        </FieldGroup>
      ) : null}
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", height: 56 },
  divider: { height: StyleSheet.hairlineWidth },
});
