import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface ConflictBannerProps {
  onResolve: () => void;
}

export function ConflictBanner({ onResolve }: ConflictBannerProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.amber }]}>
      <View style={styles.header}>
        <Ionicons name="git-merge-outline" size={18} color={theme.colors.amber} />
        <Text style={[typography.button, { color: theme.colors.ink, flex: 1, fontSize: 13 }]}>
          Marc a modifié le Jour 3 pendant votre édition
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onResolve} style={[styles.button, { borderColor: theme.colors.line }]}>
          <Text style={[typography.button, { color: theme.colors.ink, fontSize: 12 }]}>Garder la mienne</Text>
        </Pressable>
        <Pressable onPress={onResolve} style={[styles.button, { borderColor: theme.colors.line }]}>
          <Text style={[typography.button, { color: theme.colors.ink, fontSize: 12 }]}>Remplacer</Text>
        </Pressable>
        <Pressable onPress={onResolve} style={[styles.button, { backgroundColor: theme.colors.blaze, borderColor: theme.colors.blaze }]}>
          <Text style={[typography.button, { color: theme.colors.blazeInk, fontSize: 12 }]}>Fusionner</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: 1, padding: 12, gap: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  actions: { flexDirection: "row", gap: 8 },
  button: { flex: 1, height: 34, borderRadius: radius.pill, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
