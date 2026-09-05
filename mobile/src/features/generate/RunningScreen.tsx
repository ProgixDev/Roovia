import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { GENERATION_STEPS, useGenerationStore } from "../../store/generationStore";

/**
 * Simulated streaming — no real job to poll, but the same states a real one
 * would have (pending / done / failed) drive this screen exactly as if
 * there were, so swapping the mock generator for a real call later touches
 * `generationStore` only, not this UI.
 */
export default function RunningScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const status = useGenerationStore((s) => s.status);
  const stepIndex = useGenerationStore((s) => s.stepIndex);
  const resultTripId = useGenerationStore((s) => s.resultTripId);
  const forceFail = useGenerationStore((s) => s.forceFail);
  const toggleForceFail = useGenerationStore((s) => s.toggleForceFail);
  const cancel = useGenerationStore((s) => s.cancel);

  useEffect(() => {
    if (status === "done" && resultTripId) {
      // `replace`, not `push` — the whole /generate modal drops off the
      // stack once there's a result, so the back gesture from the trip
      // returns to Voyages, not back into the generation flow.
      router.replace(`/trip/${resultTripId}` as any);
    }
  }, [status, resultTripId, router]);

  const doCancel = () => {
    cancel();
    router.back();
  };

  if (status === "failed") {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.ground }]}>
        <Ionicons name="alert-circle-outline" size={40} color={theme.colors.danger} />
        <Text style={[typography.cardTitle, { color: theme.colors.ink, marginTop: 16, textAlign: "center" }]}>
          La génération a échoué
        </Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 6, textAlign: "center" }]}>
          Une erreur est survenue. Vous pouvez réessayer.
        </Text>
        <View style={{ marginTop: 24, alignSelf: "stretch", gap: 12 }}>
          <Button label="Réessayer" onPress={() => router.replace("/generate" as any)} />
          <Button label="Annuler" variant="secondary" onPress={doCancel} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
      <Pressable onLongPress={toggleForceFail} style={styles.headerWrap}>
        <Text style={[typography.sectionHead, { color: theme.colors.ink }]}>
          Création de votre voyage
        </Text>
        {forceFail ? (
          <Text style={[typography.caption, { color: theme.colors.danger, marginTop: 4 }]}>
            Échec simulé activé
          </Text>
        ) : null}
      </Pressable>

      <View style={styles.steps}>
        {GENERATION_STEPS.map((step, i) => {
          const done = i < stepIndex || status === "done";
          const active = i === stepIndex && status === "pending";
          return (
            <View key={step.label} style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: done ? theme.colors.moss : active ? theme.colors.blaze : theme.colors.surfaceSunken,
                  },
                ]}
              >
                {done ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
              </View>
              <Text
                style={[
                  typography.body,
                  { color: done || active ? theme.colors.ink : theme.colors.inkMuted },
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.skeletons}>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} height={90} radius={radius.lg} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label="Annuler" variant="secondary" onPress={doCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  headerWrap: { paddingHorizontal: 20 },
  steps: { paddingHorizontal: 20, marginTop: 28, gap: 18 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  skeletons: { paddingHorizontal: 20, marginTop: 32, gap: 12 },
  footer: { paddingHorizontal: 20, marginTop: "auto", marginBottom: 32 },
});
