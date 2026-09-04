import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ListRow } from "../../components/ui/ListRow";
import { tabBarReservedSpace } from "../../constants/layout";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { initialsFrom } from "../../lib/initials";
import { useAuthStore } from "../../store/authStore";

/**
 * The container for everything account-scoped that isn't trip-scoped —
 * traveler profile, vehicle garage, and (as later sections land) settings,
 * subscription, kids mode. Trip-scoped things (budget, checklist, journal…)
 * live inside trip detail instead; see IMPLEMENTATION_PLAN.md §0.1.
 */
export default function ProfileHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const confirmLogout = () => {
    Alert.alert("Se déconnecter ?", "Vous devrez vous reconnecter pour accéder à vos voyages.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/log-in" as any);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarReservedSpace(insets.bottom) + 24 }]}
      >
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.blaze }]}>
            <Text style={[typography.sectionHead, { color: theme.colors.blazeInk, fontSize: 20 }]}>
              {user ? initialsFrom(user.displayName, user.email) : "?"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.cardTitle, { color: theme.colors.ink }]}>
              {user?.displayName || "Voyageur"}
            </Text>
            <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Voyage</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
            <ListRow
              icon="person-outline"
              label="Profil voyageur"
              onPress={() => router.push("/profile/traveler" as any)}
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.line }]} />
            <ListRow
              icon="car-outline"
              label="Mes véhicules"
              onPress={() => router.push("/profile/vehicles" as any)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Compte</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
            <ListRow icon="settings-outline" label="Compte" onPress={() => router.push("/account" as any)} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
            <ListRow icon="log-out-outline" label="Se déconnecter" destructive onPress={confirmLogout} showChevron={false} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  section: { gap: 10 },
  card: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 14 },
  divider: { height: StyleSheet.hairlineWidth },
});
