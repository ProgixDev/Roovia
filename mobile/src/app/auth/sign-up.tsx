import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { AuthLayout } from "../../components/screens/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../store/authStore";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const nextErrors: FormErrors = {};
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    // No server yet — this stands in for `POST /auth/register`, matching its
    // real shape (email + password only; profile fields come later via the
    // account screen) so swapping in the real call is a one-line change.
    await new Promise((resolve) => setTimeout(resolve, 600));
    await login({ id: `mock-${Date.now()}`, email }, "mock-access-token", "mock-refresh-token");
    setSubmitting(false);
    router.replace("/(tabs)" as any);
  };

  return (
    <AuthLayout
      showBack
      title="Create your account"
      subtitle="Plan the route, we'll handle the rest."
      footer={
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={[typography.body, { color: theme.colors.inkMuted }]}>
            Already have an account?{" "}
          </Text>
          <Text
            onPress={() => router.replace("/auth/log-in" as any)}
            style={[typography.button, { color: theme.colors.blaze }]}
          >
            Log in
          </Text>
        </View>
      }
    >
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <TextField
        label="Password"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="At least 8 characters"
        autoComplete="new-password"
      />
      <Button label="Sign up" onPress={submit} loading={submitting} />
    </AuthLayout>
  );
}
