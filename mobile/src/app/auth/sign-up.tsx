import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { AuthLayout } from "../../features/auth/AuthLayout";
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
    if (!isValidEmail(email)) nextErrors.email = "Entrez une adresse e-mail valide";
    if (password.length < 8) nextErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    // No server yet — this stands in for `POST /auth/register`, matching its
    // real shape (email + password only; profile fields come later via the
    // account screen) so swapping in the real call is a one-line change.
    await new Promise((resolve) => setTimeout(resolve, 600));
    await login({ id: `mock-${Date.now()}`, email }, "mock-access-token", "mock-refresh-token");
    setSubmitting(false);
    // Fresh account → the post-signup setup wizard, not straight to the app.
    // Log-in (an existing account) skips it — see setup/traveler.tsx's doc.
    router.replace("/setup/traveler" as any);
  };

  return (
    <AuthLayout
      showBack
      title="Créer votre compte"
      subtitle="Planifiez l'itinéraire, on s'occupe du reste."
      footer={
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={[typography.body, { color: theme.colors.inkMuted }]}>
            Vous avez déjà un compte ?{" "}
          </Text>
          <Text
            onPress={() => router.replace("/auth/log-in" as any)}
            style={[typography.button, { color: theme.colors.blaze }]}
          >
            Se connecter
          </Text>
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
        placeholder="8 caractères minimum"
        autoComplete="new-password"
      />
      <Button label="S'inscrire" onPress={submit} loading={submitting} />
    </AuthLayout>
  );
}
