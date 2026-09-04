import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { DatedConstraint } from "../../store/travelerProfileStore";

interface ConstraintRowProps {
  constraint: DatedConstraint;
  onRemove: () => void;
}

/** "Être à Barcelone le 12" — a fixed stop the AI generator (§3) and every recalculation (§5) must respect. */
export function ConstraintRow({ constraint, onRemove }: ConstraintRowProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.row, { borderColor: theme.colors.line, backgroundColor: theme.colors.surface }]}>
      <Ionicons name="flag-outline" size={16} color={theme.colors.contour} />
      <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]} numberOfLines={1}>
        {constraint.label}
      </Text>
      <Text style={[typography.mono, { color: theme.colors.inkMuted, fontSize: 13 }]}>{constraint.date}</Text>
      <Pressable onPress={onRemove} hitSlop={10}>
        <Ionicons name="close" size={18} color={theme.colors.inkMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
