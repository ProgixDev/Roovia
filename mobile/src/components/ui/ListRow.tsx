import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface ListRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}

/** One tappable settings/hub row — icon, label, optional trailing value, chevron. */
export function ListRow({ icon, label, value, onPress, destructive = false, showChevron = true }: ListRowProps) {
  const { theme } = useTheme();
  const tint = destructive ? theme.colors.danger : theme.colors.ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceSunken }]}>
          <Ionicons name={icon} size={18} color={tint} />
        </View>
      ) : null}
      <Text style={[typography.button, { color: tint, flex: 1 }]}>{label}</Text>
      {value ? (
        <Text style={[typography.body, { color: theme.colors.inkMuted, marginRight: 4 }]}>{value}</Text>
      ) : null}
      {onPress && showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={theme.colors.inkMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, height: 56 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
