import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { FieldGroup } from "../../../components/ui/FieldGroup";
import { TextField } from "../../../components/ui/TextField";
import { DestinationAutocomplete } from "../../../features/traveler/DestinationAutocomplete";
import { stepInfo } from "../../../features/traveler/steps";
import { WizardShell } from "../../../features/wizard/WizardShell";
import { useTravelerProfileStore } from "../../../store/travelerProfileStore";

export default function TravelerDestinationStep() {
  const router = useRouter();
  const profile = useTravelerProfileStore((s) => s.profile);
  const update = useTravelerProfileStore((s) => s.update);

  const [destination, setDestination] = useState(profile.destination);
  const [datesFixed, setDatesFixed] = useState(profile.datesFixed);
  const [startDate, setStartDate] = useState(profile.startDate);
  const [endDate, setEndDate] = useState(profile.endDate);
  const [flexibleMonth, setFlexibleMonth] = useState(profile.flexibleMonth);
  const { step, stepCount, nextRoute, backRoute } = stepInfo(profile.party, "destination");

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace((backRoute ?? "/profile/traveler") as any);
  };

  const next = async () => {
    await update({ destination, datesFixed, startDate, endDate, flexibleMonth });
    router.push((nextRoute ?? "/profile/traveler/preferences") as any);
  };

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title="Où et quand ?"
      subtitle="Une destination précise ou une simple envie — les deux fonctionnent."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} />}
    >
      <DestinationAutocomplete value={destination} onChange={setDestination} />

      <FieldGroup label="Quand">
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Chip label="Dates flexibles" selected={!datesFixed} onPress={() => setDatesFixed(false)} />
          <Chip label="Dates fixes" selected={datesFixed} onPress={() => setDatesFixed(true)} />
        </View>

        {datesFixed ? (
          <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <TextField label="Date de début" value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-JJ" />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Date de fin" value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-JJ" />
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 4 }}>
            <TextField
              label="Mois souhaité"
              value={flexibleMonth}
              onChangeText={setFlexibleMonth}
              placeholder="Ex : Octobre 2026"
            />
          </View>
        )}
      </FieldGroup>
    </WizardShell>
  );
}
