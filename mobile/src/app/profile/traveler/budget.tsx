import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FieldGroup } from "../../../components/ui/FieldGroup";
import { Slider } from "../../../components/ui/Slider";
import { Stepper } from "../../../components/ui/Stepper";
import { stepInfo } from "../../../features/traveler/steps";
import { WizardShell } from "../../../features/wizard/WizardShell";
import { typography } from "../../../constants/typography";
import { useTheme } from "../../../contexts/ThemeContext";
import { useTravelerProfileStore } from "../../../store/travelerProfileStore";

export default function TravelerBudgetStep() {
  const router = useRouter();
  const { theme } = useTheme();
  const profile = useTravelerProfileStore((s) => s.profile);
  const update = useTravelerProfileStore((s) => s.update);

  const [budgetEur, setBudgetEur] = useState(profile.budgetEur);
  const [nights, setNights] = useState(profile.nights);
  const { step, stepCount, nextRoute, backRoute } = stepInfo(profile.party, "budget");

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace((backRoute ?? "/profile/traveler") as any);
  };

  const next = async () => {
    await update({ budgetEur, nights });
    router.push((nextRoute ?? "/profile/traveler/destination") as any);
  };

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title="Quel budget, pour combien de nuits ?"
      subtitle="Une fourchette suffit — vous pourrez toujours l'ajuster voyage par voyage."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} />}
    >
      <FieldGroup label="Budget total">
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={[typography.heroStat, { color: theme.colors.ink }]}>{budgetEur} €</Text>
        </View>
        <Slider value={budgetEur} min={200} max={10000} step={50} onChange={setBudgetEur} />
      </FieldGroup>

      <FieldGroup label="Durée">
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={[typography.body, { color: theme.colors.ink }]}>{nights} nuits</Text>
          <Stepper value={nights} min={1} max={90} onChange={setNights} />
        </View>
      </FieldGroup>
    </WizardShell>
  );
}
