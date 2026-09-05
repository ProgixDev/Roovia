import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { PhaseStepper } from "./PhaseStepper";

interface PhaseWizardShellProps {
  /** 0-indexed — which phase this screen is. Length of `stepLabels` sets the node count. */
  step: number;
  stepLabels: string[];
  /** The fixed header title next to the logo — "Profil voyageur", "Profil véhicule". */
  headerTitle: string;
  /** Where both "Enregistrer" and "Je compléterai plus tard" exit to. Data
   * is already auto-persisted on every field change (same across every
   * screen using this shell), so both are just an explicit way out, not a
   * save action of their own. */
  exitRoute: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shared shell for both 4-phase wizards (traveler: Qui/Où/Style/Bilan, and
 * vehicle: Basique/Équipement/Autonomie/Prêt) — a branded header (logo +
 * `headerTitle` + "Enregistrer") and the numbered `PhaseStepper`, replacing
 * the old vehicle-only `WizardShell`'s bare back-chevron + dot row (now
 * unused). One component parameterized by props rather than two
 * near-identical copies, since the two wizards differ only in their step
 * labels, header title, and exit route — everything else (scroll body,
 * fixed footer dock, "later" link) is identical.
 */
export function PhaseWizardShell({
  step,
  stepLabels,
  headerTitle,
  exitRoute,
  title,
  subtitle,
  onBack,
  children,
  footer,
}: PhaseWizardShellProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const exit = () => router.replace(exitRoute as any);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.ground }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {onBack ? (
              <Pressable onPress={onBack} hitSlop={14} style={styles.back}>
                <Ionicons name="chevron-back" size={22} color={theme.colors.ink} />
              </Pressable>
            ) : null}
            <Image source={theme.logo} style={styles.logo} resizeMode="contain" />
            <Text style={[typography.cardTitle, { color: theme.colors.ink, fontSize: 22, lineHeight: 26 }]}>
              {headerTitle}
            </Text>
          </View>
          <Pressable onPress={exit} hitSlop={10} style={styles.saveDraft}>
            <Ionicons name="bookmark-outline" size={16} color={theme.colors.inkMuted} />
            <Text style={[typography.button, { color: theme.colors.inkMuted, fontSize: 13 }]}>Enregistrer</Text>
          </Pressable>
        </View>

        <View style={styles.stepper}>
          <PhaseStepper step={step} labels={stepLabels} />
        </View>

        <Text style={[typography.sectionHead, styles.title, { color: theme.colors.ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 8 }]}>{subtitle}</Text>
        ) : null}

        <View style={styles.form}>{children}</View>
      </ScrollView>

      <View style={[styles.dock, { backgroundColor: theme.colors.ground, paddingBottom: insets.bottom + 16 }]}>
        {footer}
        <Pressable onPress={exit} hitSlop={10} style={styles.later}>
          <Text style={[typography.body, { color: theme.colors.inkMuted, textDecorationLine: "underline" }]}>
            Je compléterai plus tard
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  back: { marginRight: 2 },
  logo: { width: 36, height: 36 },
  saveDraft: { flexDirection: "row", alignItems: "center", gap: 6, height: 32 },
  stepper: { marginTop: 28, alignSelf: "center", width: "90%" },
  title: { marginTop: 28, textTransform: "uppercase" },
  form: { marginTop: 28, gap: 24 },
  dock: { paddingHorizontal: 24, paddingTop: 14, gap: 12 },
  later: { alignSelf: "center" },
});
