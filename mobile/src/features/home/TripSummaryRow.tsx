import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface TripSummaryRowProps {
  label: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

/**
 * The condensed entry point for a category that doesn't earn a full card
 * list on the home screen by default — past trips and drafts are things
 * you go looking for, not things that need to compete for space with
 * what's happening now. Tapping filters the same screen down to that
 * category instead of opening a separate one.
 */
export function TripSummaryRow({ label, count, icon, onPress }: TripSummaryRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.line, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceSunken }]}>
        <Ionicons name={icon} size={18} color={theme.colors.inkMuted} />
      </View>
      <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>{label}</Text>
      <View style={[styles.countBadge, { backgroundColor: theme.colors.surfaceSunken }]}>
        <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{count}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.inkMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 60,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
