import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface WizardShellProps {
  /** 0-indexed. */
  step: number;
  stepCount: number;
  title: string;
  subtitle?: string;
  /** The "why we ask this" line — reuses the Card treatment (`surface` + `line` border, `radius.m`). */
  hint?: string;
  /** Omitted on a wizard's first step, same reasoning as AuthLayout's `showBack`. */
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shared shell for the Traveler profile (§1) and Vehicle profile (§2)
 * wizards — same shape as the post-signup `SetupLayout` (fixed footer dock,
 * same tokens) but generalized: any step count, an explicit `onBack`
 * instead of a hardcoded fallback route, and no built-in "Passer" — these
 * are editable-hub wizards reached from Profil, not a first-run flow with
 * somewhere to skip *to*.
 */
export function WizardShell({ step, stepCount, title, subtitle, hint, onBack, children, footer }: WizardShellProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.ground }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        // Not `insets.top` — the root layout's own SafeAreaView already
        // reserves it for every non-full-bleed route.
        contentContainerStyle={[styles.scrollContent, { paddingTop: 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={14} style={styles.headerSide}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
            </Pressable>
          ) : (
            <View style={styles.headerSide} />
          )}
        </View>

        <Text style={[typography.sectionHead, { color: theme.colors.ink, marginTop: 20 }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 10 }]}>{subtitle}</Text>
        ) : null}

        {hint ? (
          <View style={[styles.hint, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.lake} />
            <Text style={[typography.body, styles.hintText, { color: theme.colors.inkMuted }]}>{hint}</Text>
          </View>
        ) : null}

        <View style={styles.form}>{children}</View>
      </ScrollView>

      <View style={[styles.dock, { backgroundColor: theme.colors.ground, paddingBottom: insets.bottom + 16 }]}>
        {footer}

        <View style={styles.dots}>
          {Array.from({ length: stepCount }, (_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i <= step ? theme.colors.blaze : theme.colors.line }]}
            />
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 26, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerSide: { width: 44, height: 40, justifyContent: "center" },
  hint: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
    padding: 18,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  hintText: { flex: 1 },
  form: { marginTop: 32, gap: 28 },
  dock: { paddingHorizontal: 26, paddingTop: 16 },
  dots: { flexDirection: "row", gap: 8, alignSelf: "center", marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
