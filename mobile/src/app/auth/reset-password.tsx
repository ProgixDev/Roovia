import { useRouter } from "expo-router";
import { useState } from "react";

import { AuthLayout } from "../../components/screens/auth/AuthLayout";
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
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (confirm !== password) nextErrors.confirm = "Passwords don't match";
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
      <AuthLayout title="Password updated" subtitle="Log in with your new password.">
        <Button label="Back to log in" onPress={() => router.replace("/auth/log-in" as any)} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showBack title="Set a new password">
      <TextField
        label="New password"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="At least 8 characters"
        autoComplete="new-password"
      />
      <TextField
        label="Confirm password"
        secure
        value={confirm}
        onChangeText={setConfirm}
        error={errors.confirm}
        placeholder="Re-enter password"
        autoComplete="new-password"
      />
      <Button label="Update password" onPress={submit} loading={submitting} />
    </AuthLayout>
  );
}
