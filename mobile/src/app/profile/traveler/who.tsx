import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { Chip, type ChipProps } from "../../../components/ui/Chip";
import { typography } from "../../../constants/typography";
import { useTheme } from "../../../contexts/ThemeContext";
import { ChildrenPanel } from "../../../features/traveler/ChildrenPanel";
import { PartyPicker } from "../../../features/traveler/PartyPicker";
import { TravelerWizardShell } from "../../../features/traveler/TravelerWizardShell";
import {
  type ChildProfile,
  type Interest,
  type PartyComposition,
  useTravelerProfileStore,
} from "../../../store/travelerProfileStore";

const INTEREST_OPTIONS: { value: Interest; label: string; icon: ChipProps["icon"] }[] = [
  { value: "beach", label: "Plage", icon: "water-outline" },
  { value: "hiking", label: "Randonnée", icon: "walk-outline" },
  { value: "food", label: "Gastronomie", icon: "restaurant-outline" },
  { value: "nature", label: "Nature", icon: "leaf-outline" },
  { value: "museums", label: "Musées", icon: "images-outline" },
  { value: "sport", label: "Sport", icon: "football-outline" },
];

/** Phase 1/4 — merges the old party/children/interests steps into one screen. */
export default function TravelerWhoStep() {
  const router = useRouter();
  const { theme } = useTheme();
  const profile = useTravelerProfileStore((s) => s.profile);
  const update = useTravelerProfileStore((s) => s.update);

  const [party, setParty] = useState<PartyComposition | null>(profile.party);
  const [children, setChildren] = useState<ChildProfile[]>(profile.children);
  const [interests, setInterests] = useState<Interest[]>(profile.interests);

  const toggleInterest = (interest: Interest) =>
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));

  const next = async () => {
    if (!party) return;
    // A party change away from "family" drops any children collected
    // earlier — a solo/couple/friends profile carrying phantom kids would
    // otherwise survive silently until someone reopens this screen.
    await update({ party, children: party === "family" ? children : [], interests });
    router.push("/profile/traveler/where" as any);
  };

  return (
    <TravelerWizardShell
      step={0}
      title="Qui vient avec vous ?"
      subtitle="On adapte l'itinéraire à votre équipage."
      footer={<Button label="Continuer" onPress={next} disabled={!party} />}
    >
      <PartyPicker value={party} onChange={setParty} />

      {party === "family" ? <ChildrenPanel kids={children} onChange={setChildren} /> : null}

      <View style={{ gap: 30 }}>
        <Text style={[typography.sectionHead, { color: theme.colors.ink, textTransform: "uppercase" }]}>
          Qu&apos;est-ce que vous aimez ?
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {INTEREST_OPTIONS.map((option) => (
            <View key={option.value} style={{ flexGrow: 1, flexBasis: "28%" }}>
              <Chip
                label={option.label}
                icon={option.icon}
                tone="tint"
                selected={interests.includes(option.value)}
                onPress={() => toggleInterest(option.value)}
              />
            </View>
          ))}
        </View>
      </View>
    </TravelerWizardShell>
  );
}
