import { useRouter } from "expo-router";
import { useState } from "react";

import { AuthLayout } from "../../features/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";

interface FormErrors {
  password?: string;
  confirm?: string;
}

export default function ResetPasswordScreen() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const nextErrors: FormErrors = {};
    if (password.length < 8) nextErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    if (confirm !== password) nextErrors.confirm = "Les mots de passe ne correspondent pas";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      // A reset drops every session on the real backend — landing back on
      // log-in, not an auto-login, matches that.
      <AuthLayout title="Mot de passe mis à jour" subtitle="Connectez-vous avec votre nouveau mot de passe.">
        <Button label="Retour à la connexion" onPress={() => router.replace("/auth/log-in" as any)} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showBack title="Choisissez un nouveau mot de passe">
      <TextField
        label="Nouveau mot de passe"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="8 caractères minimum"
        autoComplete="new-password"
      />
      <TextField
        label="Confirmer le mot de passe"
        secure
        value={confirm}
        onChangeText={setConfirm}
        error={errors.confirm}
        placeholder="Ressaisissez le mot de passe"
        autoComplete="new-password"
      />
      <Button label="Mettre à jour le mot de passe" onPress={submit} loading={submitting} />
    </AuthLayout>
  );
}
