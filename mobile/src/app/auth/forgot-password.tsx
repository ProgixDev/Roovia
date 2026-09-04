import { useRouter } from "expo-router";
import { useState } from "react";

import { AuthLayout } from "../../features/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!isValidEmail(email)) {
      setError("Entrez une adresse e-mail valide");
      return;
    }
    setError(undefined);
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout
        showBack
        title="Vérifiez vos e-mails"
        // Phrased the same way the real backend does — it never reveals
        // whether an address is actually registered.
        subtitle={`Si un compte existe pour ${email}, un lien de réinitialisation est en route.`}
      >
        {/* No real email in this prototype — "Continue" stands in for
            tapping the emailed link. */}
        <Button label="Continuer" onPress={() => router.push("/auth/reset-password" as any)} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      showBack
      title="Réinitialiser votre mot de passe"
      subtitle="Nous allons vous envoyer un lien pour le réinitialiser."
    >
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        error={error}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="vous@exemple.com"
      />
      <Button label="Envoyer le lien" onPress={submit} loading={submitting} />
    </AuthLayout>
  );
}
