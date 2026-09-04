import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { fonts } from "../../constants/fonts";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../store/authStore";

function initialsFrom(name: string | undefined, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  // See AuthLayout's identical guard: `router.back()` alone throws when this
  // screen is the first stack entry (dev Fast Refresh, or a future deep
  // link straight into /account). Falls back to the tabs, since Account is
  // reached from inside the logged-in app, not from the auth flow.
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)" as any);
    }
  };

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Guarded by the auth gate in practice (this route only exists behind a
  // logged-in session) — a type-safe fallback for the brief window before
  // that's actually enforced with a real backend.
  if (!user) return null;

  const saveProfile = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUser({
      displayName: displayName.trim() || undefined,
      username: username.trim() || undefined,
    });
    setSaving(false);
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert("Mot de passe trop court", "Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setPasswordSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPasswordSaving(false);
    setCurrentPassword("");
    setNewPassword("");
    Alert.alert("Mot de passe mis à jour");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/log-in" as any);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.ground }}
      contentContainerStyle={{
        // Not `insets.top` — the root layout's own SafeAreaView already
        // reserves it for every non-full-bleed route, this one included.
        paddingTop: 16,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 26,
      }}
    >
      <Pressable onPress={goBack} hitSlop={14} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
      </Pressable>

      <Text style={[typography.sectionHead, { color: theme.colors.ink, marginBottom: 24 }]}>
        Compte
      </Text>

      <View style={styles.avatarRow}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.blaze }]}>
          <Text style={[styles.avatarLabel, { color: theme.colors.blazeInk }]}>
            {initialsFrom(user.displayName, user.email)}
          </Text>
        </View>
        <Pressable
          onPress={() => Alert.alert("Bientôt disponible", "L'ajout de photo n'est pas encore disponible.")}
          hitSlop={10}
        >
          <Text style={[typography.button, { color: theme.colors.lake }]}>Changer la photo</Text>
        </Pressable>
      </View>

      <Text style={[typography.caption, styles.sectionLabel, { color: theme.colors.inkMuted }]}>
        Profil
      </Text>
      <View style={styles.form}>
        <TextField
          label="Nom affiché"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Ajouter un nom"
        />
        <TextField
          label="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
          placeholder="Ajouter un nom d'utilisateur"
          autoCapitalize="none"
        />
        <TextField label="E-mail" value={user.email} editable={false} />
        <Button label="Enregistrer" variant="secondary" onPress={saveProfile} loading={saving} />
      </View>

      <Text
        style={[typography.caption, styles.sectionLabel, { color: theme.colors.inkMuted, marginTop: 32 }]}
      >
        Mot de passe
      </Text>
      <View style={styles.form}>
        <TextField
          label="Mot de passe actuel"
          secure
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Mot de passe actuel"
          autoComplete="password"
        />
        <TextField
          label="Nouveau mot de passe"
          secure
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="8 caractères minimum"
          autoComplete="new-password"
        />
        <Button
          label="Mettre à jour le mot de passe"
          variant="secondary"
          onPress={changePassword}
          loading={passwordSaving}
        />
      </View>

      <View style={{ marginTop: 40 }}>
        <Button label="Se déconnecter" variant="secondary" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 8, width: 40, height: 40, justifyContent: "center" },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 28 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  // No DESIGN.md role fits big avatar-initials lettering — a one-off, not a
  // token gap worth extending the system for.
  avatarLabel: { fontFamily: fonts.bodySemiBold, fontSize: 22 },
  sectionLabel: { marginBottom: 12 },
  form: { gap: 16 },
});
