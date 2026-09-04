import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
} from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

export interface ButtonProps extends Omit<PressableProps, "style" | "onPress"> {
  label: string;
  variant?: "primary" | "secondary";
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

/**
 * Pill button in the two DESIGN.md variants: "Primary: `blaze` fill,
 * `blaze-ink` text, `shadow.light/dark`. Secondary: transparent fill, 1px
 * `ink` border, `ink` text." — including the shadow on primary only, per
 * that same line; a transparent-fill button has nothing to lift.
 */
export function Button({
  label,
  variant = "primary",
  loading = false,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();
  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;
  const textColor = isPrimary ? theme.colors.blazeInk : theme.colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary ? theme.colors.blaze : "transparent",
          borderWidth: isPrimary ? 0 : 1,
          borderColor: theme.colors.ink,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        isPrimary && {
          shadowColor: theme.shadow.color,
          shadowOpacity: theme.shadow.opacity,
          shadowOffset: theme.shadow.offset,
          shadowRadius: theme.shadow.radius,
          elevation: theme.shadow.elevation,
        },
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[typography.button, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
