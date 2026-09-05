import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { PhaseStepper } from "./PhaseStepper";

interface TravelerWizardShellProps {
  /** 0-indexed — which of the 4 phases this screen is. */
  step: 0 | 1 | 2 | 3;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shell for the 4-phase traveler profile wizard (Qui/Où/Style/Bilan) only —
 * deliberately NOT a restyle of the shared `WizardShell`, which the
 * vehicle-profile wizard also uses and which this redesign doesn't touch.
 * Branded header (logo + title + "Enregistrer") and the numbered
 * `PhaseStepper` replace `WizardShell`'s bare back-chevron + dot row; the
 * scroll body / fixed footer dock structure is otherwise the same shape.
 */
export function TravelerWizardShell({ step, title, subtitle, onBack, children, footer }: TravelerWizardShellProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Data is already auto-persisted on every field change (same as every
  // other screen in this wizard) — "Enregistrer" just gives the user an
  // explicit exit point back to the tab it was reached from.
  const saveDraft = () => router.replace("/(tabs)/profil" as any);
  const addThisLater = () => router.replace("/(tabs)/profil" as any);

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
              Profil voyageur
            </Text>
          </View>
          <Pressable onPress={saveDraft} hitSlop={10} style={styles.saveDraft}>
            <Ionicons name="bookmark-outline" size={16} color={theme.colors.inkMuted} />
            <Text style={[typography.button, { color: theme.colors.inkMuted, fontSize: 13 }]}>Enregistrer</Text>
          </Pressable>
        </View>

        <View style={styles.stepper}>
          <PhaseStepper step={step} />
        </View>

        <Text style={[typography.sectionHead, styles.title, { color: theme.colors.ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 8 }]}>{subtitle}</Text>
        ) : null}

        <View style={styles.form}>{children}</View>
      </ScrollView>

      <View style={[styles.dock, { backgroundColor: theme.colors.ground, paddingBottom: insets.bottom + 16 }]}>
        {footer}
        <Pressable onPress={addThisLater} hitSlop={10} style={styles.later}>
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
  stepper: { marginTop: 28, alignSelf: "center", width: "80%" },
  title: { marginTop: 28, textTransform: "uppercase" },
  form: { marginTop: 28, gap: 24 },
  dock: { paddingHorizontal: 24, paddingTop: 14, gap: 12 },
  later: { alignSelf: "center" },
});
