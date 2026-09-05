import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Suggestion, SuggestionTrigger } from "../../mocks/suggestions";
import { DiffPreview } from "./DiffPreview";

const TRIGGER_ICON: Record<SuggestionTrigger, keyof typeof Ionicons.glyphMap> = {
  weather: "rainy-outline",
  closed: "close-circle-outline",
  delay: "time-outline",
  plan_change: "shuffle-outline",
  group_proposal: "people-outline",
};

interface SuggestionCardProps {
  suggestion: Suggestion;
  applied: boolean;
  onAccept: () => void;
  onDismiss: () => void;
  onEdit: () => void;
}

export function SuggestionCard({ suggestion, applied, onAccept, onDismiss, onEdit }: SuggestionCardProps) {
  const { theme } = useTheme();
  const triggerColor: Record<SuggestionTrigger, string> = {
    weather: theme.colors.lake,
    closed: theme.colors.danger,
    delay: theme.colors.amber,
    plan_change: theme.colors.contour,
    group_proposal: theme.colors.moss,
  };
  const color = triggerColor[suggestion.trigger];

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: color }]}>
          <Ionicons name={TRIGGER_ICON[suggestion.trigger]} size={16} color="#FFFFFF" />
        </View>
        <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]} numberOfLines={2}>
          {suggestion.title}
        </Text>
      </View>

      <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 13, marginTop: 8 }]}>
        {suggestion.body}
      </Text>

      <View style={{ marginTop: 12 }}>
        <DiffPreview diff={suggestion.diff} />
      </View>

      {applied ? (
        <View style={styles.appliedRow}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.moss} />
          <Text style={[typography.caption, { color: theme.colors.moss }]}>Appliqué</Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable onPress={onAccept} style={[styles.button, { backgroundColor: theme.colors.blaze }]}>
            <Text style={[typography.button, { color: theme.colors.blazeInk, fontSize: 13 }]}>Accepter</Text>
          </Pressable>
          <Pressable onPress={onEdit} style={[styles.button, { borderWidth: 1, borderColor: theme.colors.line }]}>
            <Text style={[typography.button, { color: theme.colors.ink, fontSize: 13 }]}>Modifier</Text>
          </Pressable>
          <Pressable onPress={onDismiss} hitSlop={8} style={styles.dismiss}>
            <Ionicons name="close" size={18} color={theme.colors.inkMuted} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  button: { flex: 1, height: 38, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  dismiss: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  appliedRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
});
