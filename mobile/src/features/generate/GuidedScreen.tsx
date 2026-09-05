import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { Slider } from "../../components/ui/Slider";
import { Stepper } from "../../components/ui/Stepper";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { useGenerationStore } from "../../store/generationStore";
import { useTravelerProfileStore } from "../../store/travelerProfileStore";
import { DestinationAutocomplete } from "../traveler/DestinationAutocomplete";

/** For anyone who'd rather tap than type — same inputs as the prompt screen's free text, as pickers instead. */
export default function GuidedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const profile = useTravelerProfileStore((s) => s.profile);
  const start = useGenerationStore((s) => s.start);

  const [destination, setDestination] = useState(profile.destination);
  const [nights, setNights] = useState(profile.nights);
  const [budgetEur, setBudgetEur] = useState(profile.budgetEur);

  const generate = async () => {
    router.push("/generate/running" as any);
    await start("", destination, nights, budgetEur);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={14} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[typography.sectionHead, { color: theme.colors.ink }]}>Formulaire guidé</Text>

        <DestinationAutocomplete value={destination} onChange={setDestination} />

        <FieldGroup label="Durée">
          <View style={styles.row}>
            <Text style={[typography.body, { color: theme.colors.ink }]}>{nights} nuits</Text>
            <Stepper value={nights} min={1} max={90} onChange={setNights} />
          </View>
        </FieldGroup>

        <FieldGroup label="Budget total">
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <Text style={[typography.heroStat, { color: theme.colors.ink }]}>{budgetEur} €</Text>
          </View>
          <Slider value={budgetEur} min={200} max={10000} step={50} onChange={setBudgetEur} />
        </FieldGroup>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Button label="Générer mon voyage" icon="sparkles" onPress={generate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20 },
  headerSide: { width: 44, height: 40, justifyContent: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 28 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
});
