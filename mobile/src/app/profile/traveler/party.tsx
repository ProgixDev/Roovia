import { useRouter } from "expo-router";
import { useState } from "react";

import { Button } from "../../../components/ui/Button";
import { PartyPicker } from "../../../features/traveler/PartyPicker";
import { stepInfo } from "../../../features/traveler/steps";
import { WizardShell } from "../../../features/wizard/WizardShell";
import { type PartyComposition, useTravelerProfileStore } from "../../../store/travelerProfileStore";

export default function TravelerPartyStep() {
  const router = useRouter();
  const profile = useTravelerProfileStore((s) => s.profile);
  const update = useTravelerProfileStore((s) => s.update);

  const [party, setParty] = useState<PartyComposition | null>(profile.party);
  const { step, stepCount } = stepInfo(party, "party");

  // Every step is a direct entry point from the hub (tapping any card jumps
  // straight here), unlike the post-signup wizard where only step 0 has
  // nothing behind it — so every step here gets a back arrow.
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile/traveler" as any);
    }
  };

  const next = async () => {
    if (!party) return;
    await update({ party });
    // Re-derive with the just-chosen party, not the profile's stale one —
    // choosing "famille" here has to route to "children" on this same tap,
    // not one tap later.
    const { nextRoute } = stepInfo(party, "party");
    router.push((nextRoute ?? "/profile/traveler/interests") as any);
  };

  return (
    <WizardShell
      step={step}
      stepCount={stepCount}
      title="Qui vient avec vous ?"
      subtitle="Cela influence le rythme, les étapes et les activités que l'IA proposera."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} disabled={!party} />}
    >
      <PartyPicker value={party} onChange={setParty} />
    </WizardShell>
  );
}
