import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { SetupLayout } from "../../components/screens/setup/SetupLayout";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { TextField } from "../../components/ui/TextField";
import { type PartyComposition, useProfileStore } from "../../store/profileStore";

const PARTY_OPTIONS: { value: PartyComposition; label: string }[] = [
  { value: "solo", label: "Seul(e)" },
  { value: "couple", label: "En couple" },
  { value: "family", label: "En famille" },
  { value: "friends", label: "Entre amis" },
];

/**
 * Step 1 of the post-signup wizard (traveler → vehicle → trip idea). Only
 * `sign-up` routes here — `log-in` goes straight to `/(tabs)`, since an
 * existing account has presumably already been through this once. Reachable
 * again mid-wizard via the resume check in `app/index.tsx` if the app was
 * closed before finishing.
 */
export default function TravelerSetupScreen() {
  const router = useRouter();
  const traveler = useProfileStore((s) => s.traveler);
  const updateTraveler = useProfileStore((s) => s.updateTraveler);
  const advanceTo = useProfileStore((s) => s.advanceTo);

  const [party, setParty] = useState(traveler.party);
  const [destination, setDestination] = useState(traveler.destination);
  const [datesFixed, setDatesFixed] = useState(traveler.datesFixed);
  const [startDate, setStartDate] = useState(traveler.startDate);
  const [endDate, setEndDate] = useState(traveler.endDate);

  const next = async () => {
    await updateTraveler({ party, destination, datesFixed, startDate, endDate });
    await advanceTo(1);
    router.push("/setup/vehicle" as any);
  };

  return (
    <SetupLayout
      step={0}
      title="Qui vient avec vous ?"
      subtitle="Parlez-nous de ce voyage."
      hint="L'IA ne planifie pas de la même façon pour un voyageur solo que pour une famille de cinq — cela influence le rythme, les étapes et les activités proposées."
      footer={<Button label="Suivant" onPress={next} />}
    >
      <FieldGroup label="Qui vient">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {PARTY_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={party === option.value}
              onPress={() => setParty(option.value)}
            />
          ))}
        </View>
      </FieldGroup>

      <TextField
        label="Destination"
        value={destination}
        onChangeText={setDestination}
        placeholder="Espagne, Gorges du Verdon, Route 66…"
      />

      <FieldGroup label="Quand">
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Chip label="Dates flexibles" selected={!datesFixed} onPress={() => setDatesFixed(false)} />
          <Chip label="Dates fixes" selected={datesFixed} onPress={() => setDatesFixed(true)} />
        </View>

        {datesFixed ? (
          <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Date de début"
                value={startDate}
                onChangeText={setStartDate}
                placeholder="AAAA-MM-JJ"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Date de fin"
                value={endDate}
                onChangeText={setEndDate}
                placeholder="AAAA-MM-JJ"
              />
            </View>
          </View>
        ) : null}
      </FieldGroup>
    </SetupLayout>
  );
}
