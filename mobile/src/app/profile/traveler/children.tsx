import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { ChildAgeRow } from "../../../features/traveler/ChildAgeRow";
import { stepInfo } from "../../../features/traveler/steps";
import { WizardShell } from "../../../features/wizard/WizardShell";
import { type ChildProfile, useTravelerProfileStore } from "../../../store/travelerProfileStore";

export default function TravelerChildrenStep() {
  const router = useRouter();
  const profile = useTravelerProfileStore((s) => s.profile);
  const update = useTravelerProfileStore((s) => s.update);

  const [children, setChildren] = useState<ChildProfile[]>(profile.children);
  const { step, stepCount, nextRoute, backRoute } = stepInfo(profile.party, "children");

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace((backRoute ?? "/profile/traveler") as any);
  };

  const addChild = () => setChildren((prev) => [...prev, { id: `child_${Date.now()}`, age: 8 }]);
  const updateAge = (id: string, age: number) =>
    setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, age } : c)));
  const remove = (id: string) => setChildren((prev) => prev.filter((c) => c.id !== id));

  const next = async () => {
    await update({ children });
    router.push((nextRoute ?? "/profile/traveler/interests") as any);
  };

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title="Combien d'enfants ?"
      subtitle="L'âge de chacun ajuste les activités et le rythme de route proposés."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} />}
    >
      <View style={{ gap: 12 }}>
        {children.map((child, i) => (
          <ChildAgeRow
            key={child.id}
            child={child}
            index={i}
            onChangeAge={(age) => updateAge(child.id, age)}
            onRemove={() => remove(child.id)}
          />
        ))}
        <Button label="Ajouter un enfant" variant="secondary" icon="add" onPress={addChild} />
      </View>
    </WizardShell>
  );
}
