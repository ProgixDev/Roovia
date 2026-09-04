import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius } from "../../../constants/themes";
import { typography } from "../../../constants/typography";
import { useTheme } from "../../../contexts/ThemeContext";
import { useProfileStore, type SetupStep } from "../../../store/profileStore";

const STEP_COUNT = 3;

interface SetupLayoutProps {
  step: SetupStep;
  title: string;
  subtitle?: string;
  /** The "why we ask this" line — DESIGN.md has no dedicated role for an
   * inline explainer, so this reuses the Card treatment (`surface` +
   * `line` border, `radius.m`) rather than inventing a new one. */
  hint?: string;
  /** Omitted on the first step — reached only via `replace` from sign-up,
   * so there's nothing behind it (same reasoning as AuthLayout's `showBack`). */
  showBack?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shared shell for the three post-signup setup screens. Distinct from
 * `AuthLayout` (progress dots + Skip instead of a bare back chevron) but
 * follows the same shape on purpose — same keyboard handling, same
 * left-aligned title treatment, same DESIGN.md tokens throughout.
 *
 * The footer button and the dots live OUTSIDE the `ScrollView`, in their
 * own fixed bar below it — not just pushed down by a spacer inside the
 * scroll content. A spacer only reads as "pinned" while the content is
 * shorter than the screen; the moment a step grows a field (or the
 * keyboard eats vertical space), that content pushes the button along
 * with it. Docking it in a sibling bar means the button's position never
 * depends on how much is above it — only the form scrolls.
 */
export function SetupLayout({ step, title, subtitle, hint, showBack, children, footer }: SetupLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const skip = useProfileStore((s) => s.skip);

  const handleSkip = async () => {
    await skip();
    router.replace("/(tabs)" as any);
  };

  // Same guard as AuthLayout/account: `router.back()` alone throws when
  // this screen is the first stack entry (dev Fast Refresh, or a future
  // deep link straight into /setup/vehicle or /setup/trip). Falls back to
  // the wizard's own start, same convention as AuthLayout falling back to
  // `/auth` rather than trying to resolve which step came before this one.
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/setup/traveler" as any);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.ground }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        // Not `insets.top` here — the root layout's own SafeAreaView already
        // reserves the top inset for every non-full-bleed route (this one
        // included), so adding it again doubled the gap above the header.
        contentContainerStyle={[styles.scrollContent, { paddingTop: 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          {showBack ? (
            <Pressable onPress={goBack} hitSlop={14} style={styles.headerSide}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
            </Pressable>
          ) : (
            <View style={styles.headerSide} />
          )}

          <Pressable onPress={handleSkip} hitSlop={14} style={styles.skip}>
            <Text style={[typography.button, { color: theme.colors.inkMuted }]}>Passer</Text>
          </Pressable>
        </View>

        <Text style={[typography.sectionHead, { color: theme.colors.ink, marginTop: 32 }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 10 }]}>
            {subtitle}
          </Text>
        ) : null}

        {hint ? (
          <View
            style={[
              styles.hint,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.line },
            ]}
          >
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.lake} />
            <Text style={[typography.body, styles.hintText, { color: theme.colors.inkMuted }]}>
              {hint}
            </Text>
          </View>
        ) : null}

        <View style={styles.form}>{children}</View>
      </ScrollView>

      <View
        style={[
          styles.dock,
          {
            backgroundColor: theme.colors.ground,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        {footer}

        <View style={styles.dots}>
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i <= step ? theme.colors.blaze : theme.colors.line },
              ]}
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
  skip: { height: 40, justifyContent: "center" },
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
  // The fixed bar itself — hairline top border is what visually separates
  // Opaque background only — no border. That's still what keeps content
  // scrolled up underneath from showing through; a dividing line on top of
  // it turned out to read as an unwanted extra rule, not separation.
  dock: {
    paddingHorizontal: 26,
    paddingTop: 16,
  },
  dots: { flexDirection: "row", gap: 8, alignSelf: "center", marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
