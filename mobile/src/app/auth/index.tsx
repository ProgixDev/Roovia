import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { AuthLayout } from "../../components/screens/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../store/authStore";

type Provider = "apple" | "google";

/** Google's actual brand mark — Ionicons only has a flat monochrome "G". */
function GoogleGlyph() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <Path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <Path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <Path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </Svg>
  );
}

/**
 * The auth entry point onboarding lands on. Exactly four options, in order:
 * Apple, Google, a divider, then email. `sign-up`/`log-in` are `push`ed
 * from here (not `replace`d), so their back button correctly returns here.
 *
 * Apple/Google are mocked the same way email is (no real OAuth SDK yet),
 * just tagged with a provider-specific placeholder identity. Both brand
 * buttons use Apple/Google's own fixed white-outlined styling — a real
 * external requirement, not a themed `colors.surface` — so they don't
 * shift with the app's light/dark theme.
 */
export default function AuthChooserScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState<Provider | null>(null);

  const continueWith = async (provider: Provider) => {
    setLoading(provider);
    await new Promise((resolve) => setTimeout(resolve, 600));
    await login(
      { id: `mock-${provider}-${Date.now()}`, email: `${provider}-user@example.com` },
      "mock-access-token",
      "mock-refresh-token",
    );
    setLoading(null);
    router.replace("/(tabs)" as any);
  };

  return (
    <AuthLayout logo title="Welcome to Roovia" subtitle="Your next road trip starts here.">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: loading !== null, busy: loading === "apple" }}
        onPress={() => continueWith("apple")}
        disabled={loading !== null}
        style={({ pressed }) => [
          styles.brandButton,
          {
            backgroundColor: "#FFFFFF",
            borderColor: "#DADCE0",
            opacity: loading !== null && loading !== "apple" ? 0.5 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="logo-apple" size={20} color="#1F1F1F" />
        <Text style={styles.brandLabel}>
          {loading === "apple" ? "Continuing…" : "Continue with Apple"}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: loading !== null, busy: loading === "google" }}
        onPress={() => continueWith("google")}
        disabled={loading !== null}
        style={({ pressed }) => [
          styles.brandButton,
          {
            backgroundColor: "#FFFFFF",
            borderColor: "#DADCE0",
            opacity: loading !== null && loading !== "google" ? 0.5 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <GoogleGlyph />
        <Text style={styles.brandLabel}>
          {loading === "google" ? "Continuing…" : "Continue with Google"}
        </Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.line }]} />
        <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.line }]} />
      </View>

      <Button label="Continue with email" onPress={() => router.push("/auth/sign-up" as any)} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 2 },
  dividerLine: { flex: 1, height: 1 },
  brandButton: {
    height: 54,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  // Fixed dark text, like the fixed white fill above — Google/Apple's own
  // neutral-button spec, not `theme.colors.ink`. Size still follows
  // DESIGN.md's Button/emphasis role — the brand exception is for color
  // only, not the type scale.
  brandLabel: { ...typography.button, color: "#1F1F1F" },
});
