import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

export interface ChipProps extends Omit<PressableProps, "style" | "onPress"> {
  label: string;
  selected?: boolean;
  /** `blaze` (default) for a form single-select (DESIGN.md's literal spec).
   * `ink` for a view filter (e.g. Home's status tabs) — a filter choosing
   * what's on screen isn't the same kind of "selected" as a form answer,
   * and filled-blaze there would visually compete with the screen's actual
   * primary action instead of reading as a neutral toggle. */
  tone?: "blaze" | "ink";
  onPress?: () => void;
}

/**
 * DESIGN.md § Components: "surface background, 1px line border, pill
 * radius, ink text. Active/selected state: invert to filled blaze." A
 * single-select group is just several of these with one `selected` at a
 * time — no separate group component needed.
 */
export function Chip({ label, selected, tone = "blaze", onPress, ...props }: ChipProps) {
  const { theme } = useTheme();
  const fill = tone === "blaze" ? theme.colors.blaze : theme.colors.ink;
  const onFill = tone === "blaze" ? theme.colors.blazeInk : theme.colors.ground;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? fill : theme.colors.surface,
          borderColor: selected ? fill : theme.colors.line,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      {...props}
    >
      <Text style={[typography.button, { color: selected ? onFill : theme.colors.ink }]}>
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
