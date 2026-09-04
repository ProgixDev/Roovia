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
    if (!isValidEmail(email)) nextErrors.email = "Entrez une adresse e-mail valide";
    if (password.length < 1) nextErrors.password = "Entrez votre mot de passe";
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
      title="Ravi de vous revoir"
      subtitle="Connectez-vous pour reprendre là où vous en étiez."
      footer={
        <View style={{ gap: 16, marginTop: 24 }}>
          <Text
            onPress={() => router.push("/auth/forgot-password" as any)}
            style={[typography.button, { textAlign: "center", color: theme.colors.lake }]}
          >
            Mot de passe oublié ?
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={[typography.body, { color: theme.colors.inkMuted }]}>Nouveau ici ? </Text>
            <Text
              onPress={() => router.replace("/auth/sign-up" as any)}
              style={[typography.button, { color: theme.colors.blaze }]}
            >
              Créer un compte
            </Text>
          </View>
        </View>
      }
    >
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="vous@exemple.com"
      />
      <TextField
        label="Mot de passe"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="Votre mot de passe"
        autoComplete="password"
      />
      <Button label="Se connecter" onPress={submit} loading={submitting} />
    </AuthLayout>
  );
}
