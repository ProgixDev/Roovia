import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { EmptyState } from "../../components/ui/EmptyState";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Placeholder for the modal the tab bar's `+` opens. The real flow — prompt
 * screen prefilled from the traveler + vehicle profiles, simulated
 * streaming generation, result timeline — is todo.md's "AI trip generation"
 * section, §3 in IMPLEMENTATION_PLAN.md, built right after those two
 * profiles exist to prefill from.
 */
export default function GenerateScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    // Not `insets.top` — the root layout's own SafeAreaView already
    // reserves it for every non-full-bleed route, this modal included.
    <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Fermer"
          style={[styles.close, { backgroundColor: theme.colors.surfaceSunken }]}
        >
          <Ionicons name="close" size={20} color={theme.colors.ink} />
        </Pressable>
      </View>

      <EmptyState
        icon="sparkles-outline"
        title="Génération IA"
        body="Décrivez le voyage dont vous rêvez et laissez l'IA construire l'itinéraire — bientôt disponible."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, alignItems: "flex-end" },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
