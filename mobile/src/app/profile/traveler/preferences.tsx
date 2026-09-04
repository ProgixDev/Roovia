import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FieldGroup } from "../../../components/ui/FieldGroup";
import { Stepper } from "../../../components/ui/Stepper";
import { TextField } from "../../../components/ui/TextField";
import { ConstraintRow } from "../../../features/traveler/ConstraintRow";
import { PreferenceSlider } from "../../../features/traveler/PreferenceSlider";
import { stepInfo } from "../../../features/traveler/steps";
import { WizardShell } from "../../../features/wizard/WizardShell";
import { typography } from "../../../constants/typography";
import { useTheme } from "../../../contexts/ThemeContext";
import { type DatedConstraint, useTravelerProfileStore } from "../../../store/travelerProfileStore";

export default function TravelerPreferencesStep() {
  const router = useRouter();
  const { theme } = useTheme();
  const profile = useTravelerProfileStore((s) => s.profile);
  const update = useTravelerProfileStore((s) => s.update);
  const markComplete = useTravelerProfileStore((s) => s.markComplete);

  const [pace, setPace] = useState(profile.pace);
  const [maxDrivingHoursPerDay, setMaxDrivingHoursPerDay] = useState(profile.maxDrivingHoursPerDay);
  const [natureVsCity, setNatureVsCity] = useState(profile.natureVsCity);
  const [freeVsPaid, setFreeVsPaid] = useState(profile.freeVsPaid);
  const [constraints, setConstraints] = useState<DatedConstraint[]>(profile.constraints);
  const [newLabel, setNewLabel] = useState("");
  const [newDate, setNewDate] = useState("");

  const { step, stepCount, backRoute } = stepInfo(profile.party, "preferences");

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace((backRoute ?? "/profile/traveler") as any);
  };

  const addConstraint = () => {
    if (!newLabel.trim() || !newDate.trim()) return;
    setConstraints((prev) => [...prev, { id: `constraint_${Date.now()}`, label: newLabel.trim(), date: newDate.trim() }]);
    setNewLabel("");
    setNewDate("");
  };

  const removeConstraint = (id: string) => setConstraints((prev) => prev.filter((c) => c.id !== id));

  const finish = async () => {
    await update({ pace, maxDrivingHoursPerDay, natureVsCity, freeVsPaid, constraints });
    await markComplete();
    router.replace("/profile/traveler" as any);
  };

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title="Votre rythme de route"
      subtitle="Dernière étape — comment vous aimez voyager, et vos contraintes fixes."
      onBack={goBack}
      footer={<Button label="Terminer" onPress={finish} />}
    >
      <PreferenceSlider label="Rythme" leftHint="Tranquille" rightHint="Intensif" value={pace} onChange={setPace} />

      <FieldGroup label="Conduite max par jour">
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={[typography.body, { color: theme.colors.ink }]}>{maxDrivingHoursPerDay} h</Text>
          <Stepper value={maxDrivingHoursPerDay} min={1} max={10} onChange={setMaxDrivingHoursPerDay} />
        </View>
      </FieldGroup>

      <PreferenceSlider label="Ambiance" leftHint="Nature" rightHint="Ville" value={natureVsCity} onChange={setNatureVsCity} />
      <PreferenceSlider label="Étapes" leftHint="Gratuit" rightHint="Payant" value={freeVsPaid} onChange={setFreeVsPaid} />

      <FieldGroup label="Contraintes fixes">
        <View style={{ gap: 10 }}>
          {constraints.map((c) => (
            <ConstraintRow key={c.id} constraint={c} onRemove={() => removeConstraint(c.id)} />
          ))}

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 2 }}>
              <TextField label="Étape" value={newLabel} onChangeText={setNewLabel} placeholder="Être à Barcelone" />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Date" value={newDate} onChangeText={setNewDate} placeholder="AAAA-MM-JJ" />
            </View>
          </View>
          <Button label="Ajouter la contrainte" variant="secondary" icon="add" onPress={addConstraint} />
        </View>
      </FieldGroup>
    </WizardShell>
  );
}
