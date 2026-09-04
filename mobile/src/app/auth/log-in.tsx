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

export default function LogInScreen() {
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
    if (password.length < 1) nextErrors.password = "Enter your password";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    await login({ id: `mock-${Date.now()}`, email }, "mock-access-token", "mock-refresh-token");
    setSubmitting(false);
    router.replace("/(tabs)" as any);
  };

  return (
    <AuthLayout
      showBack
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
      footer={
        <View style={{ gap: 16, marginTop: 24 }}>
          <Text
            onPress={() => router.push("/auth/forgot-password" as any)}
            style={[typography.button, { textAlign: "center", color: theme.colors.lake }]}
          >
            Forgot password?
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={[typography.body, { color: theme.colors.inkMuted }]}>New here? </Text>
            <Text
              onPress={() => router.replace("/auth/sign-up" as any)}
              style={[typography.button, { color: theme.colors.blaze }]}
            >
              Create an account
            </Text>
          </View>
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
        placeholder="Your password"
        autoComplete="password"
      />
      <Button label="Log in" onPress={submit} loading={submitting} />
    </AuthLayout>
  );
}
