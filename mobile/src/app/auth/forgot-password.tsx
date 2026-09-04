import { useRouter } from "expo-router";
import { useState } from "react";

import { AuthLayout } from "../../components/screens/auth/AuthLayout";
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
      setError("Enter a valid email address");
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
        title="Check your email"
        // Phrased the same way the real backend does — it never reveals
        // whether an address is actually registered.
        subtitle={`If an account exists for ${email}, a reset link is on its way.`}
      >
        {/* No real email in this prototype — "Continue" stands in for
            tapping the emailed link. */}
        <Button label="Continue" onPress={() => router.push("/auth/reset-password" as any)} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showBack title="Reset your password" subtitle="We'll send a link to reset it.">
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={error}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Button label="Send reset link" onPress={submit} loading={submitting} />
    </AuthLayout>
  );
}
