import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface FieldGroupProps {
  label: string;
  children: ReactNode;
}

/**
 * A caption-style label over a non-`TextField` control (a `Chip` row, most
 * often) — the same label treatment `TextField` renders internally, pulled
 * out so a chip group gets the same visual anchor a text input gets for
 * free instead of floating under the screen title with nothing naming it.
 */
export function FieldGroup({ label, children }: FieldGroupProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
});
