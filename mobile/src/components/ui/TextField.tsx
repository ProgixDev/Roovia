import { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { PasswordInput } from "./PasswordInput";

export interface TextFieldProps extends TextInputProps {
  label: string;
  /** Renders `PasswordInput` (reveal toggle) instead of a plain `TextInput`. */
  secure?: boolean;
  error?: string;
}

/**
 * Labeled input in a bordered box (DESIGN.md `radius.sm` — "inputs, small
 * controls"). `secure` swaps in `PasswordInput`, which owns its own
 * `secureTextEntry` and needs no styling of its own — this box IS its
 * container.
 *
 * Border color is a priority stack: `danger` (error) beats `lake` (focus)
 * beats `line` (resting) — DESIGN.md's "focus ring `lake`" reads as an
 * error-severity override in practice, the same way a browser doesn't hide
 * a red validation border just because the field still has focus. The
 * 2px-offset ring the doc describes has no direct RN equivalent, so this
 * approximates it with a thicker (2px, from 1px) border instead.
 *
 * Two JSX branches rather than one dynamically-chosen component: a union
 * component reference makes TS check `props` against both prop types at
 * once, which fights the fact `PasswordInputProps` deliberately omits
 * `secureTextEntry`.
 */
export function TextField({
  label,
  secure,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  // Typed off the prop itself rather than a hand-picked RN event type — the
  // installed RN version's actual `onFocus`/`onBlur` signature, whatever it is.
  const handleFocus: TextInputProps["onFocus"] = (e) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur: TextInputProps["onBlur"] = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const borderColor = error ? theme.colors.danger : focused ? theme.colors.lake : theme.colors.line;

  return (
    <View style={styles.wrap}>
      <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{label}</Text>
      <View
        style={[
          styles.box,
          {
            backgroundColor: theme.colors.surface,
            borderColor,
            borderWidth: error || focused ? 2 : 1,
            opacity: props.editable === false ? 0.6 : 1,
          },
        ]}
      >
        {secure ? (
          <PasswordInput
            style={[typography.body, { color: theme.colors.ink }, styles.input, style]}
            placeholderTextColor={theme.colors.inkMuted}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        ) : (
          <TextInput
            style={[typography.body, { color: theme.colors.ink }, styles.input, style]}
            placeholderTextColor={theme.colors.inkMuted}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        )}
      </View>
      {error ? (
        <Text style={[typography.body, styles.error, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  box: {
    // `minHeight`, not `height`: a fixed height clips or overflows the input
    // whenever a caller passes a taller `style` (multiline, e.g. trip.tsx's
    // idea field) — the input grows past a fixed-height box instead of the
    // box growing with it, which is what put text on top of the label
    // above. `minHeight` still gives single-line fields their usual size,
    // since their natural content is well under it.
    minHeight: 54,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
  },
  input: { padding: 0 },
  error: { fontSize: 12, lineHeight: 16 },
});
