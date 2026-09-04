import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { Chip, type ChipProps } from "../../../components/ui/Chip";
import { stepInfo } from "../../../features/traveler/steps";
import { WizardShell } from "../../../features/wizard/WizardShell";
import { type Interest, useTravelerProfileStore } from "../../../store/travelerProfileStore";

const OPTIONS: { value: Interest; label: string; icon: ChipProps["icon"] }[] = [
  { value: "beach", label: "Plage", icon: "umbrella-outline" },
  { value: "hiking", label: "Randonnée", icon: "walk-outline" },
  { value: "sport", label: "Sport", icon: "fitness-outline" },
  { value: "museums", label: "Musées", icon: "images-outline" },
  { value: "food", label: "Gastronomie", icon: "restaurant-outline" },
  { value: "nature", label: "Nature", icon: "leaf-outline" },
];

export default function TravelerInterestsStep() {
  const router = useRouter();
  const profile = useTravelerProfileStore((s) => s.profile);
  const update = useTravelerProfileStore((s) => s.update);

  const [interests, setInterests] = useState<Interest[]>(profile.interests);
  const { step, stepCount, nextRoute, backRoute } = stepInfo(profile.party, "interests");

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace((backRoute ?? "/profile/traveler") as any);
  };

  const toggle = (interest: Interest) =>
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));

  const next = async () => {
    await update({ interests });
    router.push((nextRoute ?? "/profile/traveler/budget") as any);
  };

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title="Qu'est-ce qui vous fait voyager ?"
      subtitle="Choisissez tout ce qui vous parle — plusieurs réponses possibles."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} />}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            icon={option.icon}
            selected={interests.includes(option.value)}
            onPress={() => toggle(option.value)}
          />
        ))}
      </View>
    </WizardShell>
  );
}
