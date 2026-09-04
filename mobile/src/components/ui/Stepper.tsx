import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function Stepper({ value, min = 0, max = 99, onChange }: StepperProps) {
  const { theme } = useTheme();

  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <View style={styles.row}>
      <Pressable
        onPress={dec}
        disabled={value <= min}
        hitSlop={8}
        style={[styles.button, { borderColor: theme.colors.line, opacity: value <= min ? 0.4 : 1 }]}
      >
        <Ionicons name="remove" size={18} color={theme.colors.ink} />
      </Pressable>
      <Text style={[typography.cardTitle, { color: theme.colors.ink, minWidth: 28, textAlign: "center" }]}>
        {value}
      </Text>
      <Pressable
        onPress={inc}
        disabled={value >= max}
        hitSlop={8}
        style={[styles.button, { borderColor: theme.colors.line, opacity: value >= max ? 0.4 : 1 }]}
      >
        <Ionicons name="add" size={18} color={theme.colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  button: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
