import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

export interface ChipProps extends Omit<PressableProps, "style" | "onPress"> {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/**
 * DESIGN.md § Components: "surface background, 1px line border, pill
 * radius, ink text. Active/selected state: invert to filled blaze." A
 * single-select group is just several of these with one `selected` at a
 * time — no separate group component needed.
 */
export function Chip({ label, selected, onPress, ...props }: ChipProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.blaze : theme.colors.surface,
          borderColor: selected ? theme.colors.blaze : theme.colors.line,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      {...props}
    >
      <Text
        style={[typography.button, { color: selected ? theme.colors.blazeInk : theme.colors.ink }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
