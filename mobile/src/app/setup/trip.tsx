import { useRouter } from "expo-router";
import { useState } from "react";

import { SetupLayout } from "../../components/screens/setup/SetupLayout";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { useProfileStore } from "../../store/profileStore";

export default function TripSetupScreen() {
  const router = useRouter();
  const tripIdea = useProfileStore((s) => s.tripIdea);
  const complete = useProfileStore((s) => s.complete);
  const [idea, setIdea] = useState(tripIdea);
  const [finishing, setFinishing] = useState(false);

  const finish = async () => {
    setFinishing(true);
    // No AI trip generation yet — that's its own todo section. This just
    // stores the idea so the real prompt screen can prefill it later.
    await complete(idea);
    setFinishing(false);
    router.replace("/(tabs)" as any);
  };

  return (
    <SetupLayout
      step={2}
      showBack
      title="Vous êtes prêt(e)"
      subtitle="Déjà une idée de voyage ?"
      hint="Facultatif — vous pourrez toujours créer un voyage de zéro plus tard. Cela donne juste une longueur d'avance à l'IA si vous savez déjà où vous allez."
      // Always "Terminer", even with an empty idea — the header's own
      // "Passer" link already means "abandon the wizard"; a second,
      // differently-worded skip-ish label here right next to it would just
      // read as confusing.
      footer={<Button label="Terminer" onPress={finish} loading={finishing} />}
    >
      <TextField
        label="Idée de voyage"
        value={idea}
        onChangeText={setIdea}
        placeholder="3 semaines en Espagne, via Valence, budget 2000 €…"
        multiline
        numberOfLines={4}
        style={{ height: 96, textAlignVertical: "top" }}
      />
    </SetupLayout>
  );
}
