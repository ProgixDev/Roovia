import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { PaywallSheet } from "../paywall/PaywallSheet";
import { useEntitlementsStore } from "../../store/entitlementsStore";
import { useGenerationStore } from "../../store/generationStore";
import { useTravelerProfileStore } from "../../store/travelerProfileStore";
import { useVehiclesStore } from "../../store/vehiclesStore";
import { buildContextChips } from "./contextChips";

const EXAMPLES = [
  "3 semaines en Espagne, via Valence, budget 2000 €",
  "Un week-end tranquille dans les Alpes",
  "10 jours au Portugal, beaucoup de plages",
];

export default function PromptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const profile = useTravelerProfileStore((s) => s.profile);
  const vehicles = useVehiclesStore((s) => s.vehicles);
  const activeVehicleId = useVehiclesStore((s) => s.activeId);
  const start = useGenerationStore((s) => s.start);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) ?? null;
  const [prompt, setPrompt] = useState("");
  const [chips, setChips] = useState<string[]>(() => buildContextChips(profile, activeVehicle));
  const [paywallOpen, setPaywallOpen] = useState(false);

  const entitlement = useEntitlementsStore((s) => s.entitlement);
  const canGenerateQuota = useEntitlementsStore((s) => s.canGenerate);
  const generationsRemaining = useEntitlementsStore((s) => s.generationsRemaining);
  const recordGeneration = useEntitlementsStore((s) => s.recordGeneration);

  const removeChip = (chip: string) => setChips((prev) => prev.filter((c) => c !== chip));

  const hasInput = prompt.trim().length > 0 || chips.length > 0;

  const generate = async () => {
    if (!canGenerateQuota()) {
      setPaywallOpen(true);
      return;
    }
    recordGeneration();
    router.push("/generate/running" as any);
    await start(prompt, profile.destination, profile.nights, profile.budgetEur);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Fermer"
          style={[styles.close, { backgroundColor: theme.colors.surfaceSunken }]}
        >
          <Ionicons name="close" size={20} color={theme.colors.ink} />
        </Pressable>
      </View>

      {!entitlement.active ? (
        <View style={styles.quotaRow}>
          <Ionicons name="sparkles-outline" size={14} color={theme.colors.inkMuted} />
          <Text style={[typography.caption, { color: theme.colors.inkMuted, textTransform: "none", letterSpacing: 0 }]}>
            {generationsRemaining()} génération{generationsRemaining() > 1 ? "s" : ""} restante{generationsRemaining() > 1 ? "s" : ""} ce mois-ci
          </Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[typography.sectionHead, { color: theme.colors.ink }]}>Décrivez votre voyage</Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 8 }]}>
          {"L'IA construit un itinéraire complet à partir de quelques mots."}
        </Text>

        <View
          style={[styles.inputBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}
        >
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="3 semaines en Espagne, via Valence, budget 2000 €…"
            placeholderTextColor={theme.colors.inkMuted}
            multiline
            style={[typography.body, styles.input, { color: theme.colors.ink }]}
          />
        </View>

        <View style={styles.examples}>
          {EXAMPLES.map((example) => (
            <Pressable
              key={example}
              onPress={() => setPrompt(example)}
              style={[styles.exampleChip, { borderColor: theme.colors.line }]}
            >
              <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 13 }]} numberOfLines={1}>
                {example}
              </Text>
            </Pressable>
          ))}
        </View>

        {chips.length > 0 ? (
          <FieldGroup label="D'après votre profil">
            <View style={styles.chipRow}>
              {chips.map((chip) => (
                <View key={chip} style={[styles.contextChip, { backgroundColor: theme.colors.blaze }]}>
                  <Text style={[typography.button, { color: theme.colors.blazeInk, fontSize: 13 }]}>{chip}</Text>
                  <Pressable onPress={() => removeChip(chip)} hitSlop={8}>
                    <Ionicons name="close" size={14} color={theme.colors.blazeInk} />
                  </Pressable>
                </View>
              ))}
            </View>
          </FieldGroup>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.ground, paddingBottom: insets.bottom + 20 }]}>
        <Button label="Générer mon voyage" icon="sparkles" onPress={generate} disabled={!hasInput} />
        <Pressable onPress={() => router.push("/generate/guided" as any)} style={styles.guidedLink}>
          <Text style={[typography.button, { color: theme.colors.inkMuted }]}>
            Préférer un formulaire guidé
          </Text>
        </Pressable>
      </View>

      <PaywallSheet visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, alignItems: "flex-end" },
  quotaRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, marginTop: 4 },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 24, paddingBottom: 24 },
  inputBox: { borderRadius: radius.md, borderWidth: 1, padding: 16, minHeight: 120 },
  input: { minHeight: 88, textAlignVertical: "top" },
  examples: { gap: 8 },
  exampleChip: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  contextChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  guidedLink: { alignItems: "center", height: 40, justifyContent: "center" },
});
