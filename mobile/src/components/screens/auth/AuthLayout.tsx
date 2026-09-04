import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { typography } from "../../../constants/typography";
import { useTheme } from "../../../contexts/ThemeContext";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  /** A back chevron to the previous auth screen — omitted where there's
   * nothing meaningful to return to (sign-up/log-in swap via `replace`). */
  showBack?: boolean;
  /** Centers `theme.logo` above a centered title/subtitle — the entry-point
   * treatment (chooser screen only). Every other auth screen keeps the
   * plain left-aligned header, unchanged. */
  logo?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shared shell for the auth screens: keyboard-avoiding scroll, title +
 * subtitle, a form column, and an optional footer (links, a second CTA).
 * Unlike onboarding, this respects the app's normal light/dark theme —
 * these are functional screens, not a fixed-palette brand moment.
 */
export function AuthLayout({ title, subtitle, showBack, logo, children, footer }: AuthLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // `router.back()` alone throws "GO_BACK was not handled" whenever this
  // screen is the first entry in the stack — reachable in dev via Fast
  // Refresh landing here directly, and in production via any future deep
  // link straight into sign-up/log-in/reset-password. Falling back to the
  // chooser keeps the button correct regardless of how the screen was
  // reached.
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/auth" as any);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.ground }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          // Not `insets.top` — the root layout's own SafeAreaView already
          // reserves it for every non-full-bleed route, this one included.
          { paddingTop: 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {showBack && (
          <Pressable onPress={goBack} hitSlop={14} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
          </Pressable>
        )}

        {logo && <Image source={theme.logo} style={styles.logo} resizeMode="contain" />}

        {/* Hero-stat scale (44px/900) for the chooser's brand moment —
            DESIGN.md's own type scale doesn't literally list this use, but
            it's the same "genuine hero headline" job as the role's other
            examples. Every other screen's plain title uses section-head
            (28px/700), DESIGN.md's actual "screen titles" role. */}
        <Text
          style={[
            logo ? typography.heroStat : typography.sectionHead,
            { color: theme.colors.ink, marginTop: 8 },
            logo && styles.centered,
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              typography.body,
              { color: theme.colors.inkMuted, marginTop: 8 },
              logo && styles.centered,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}

        <View style={[styles.form, logo && styles.formLogoSpacing]}>{children}</View>

        {footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 26 },
  back: { marginBottom: 12, width: 40, height: 40, justifyContent: "center" },
  logo: { width: 96, height: 96, alignSelf: "center", marginBottom: 8 },
  centered: { textAlign: "center" },
  form: { marginTop: 32, gap: 18 },
  // The chooser's centered logo+title header reads visually denser than
  // the other screens' plain left-aligned title, so it wants more air
  // before the buttons start.
  formLogoSpacing: { marginTop: 146 },
});
