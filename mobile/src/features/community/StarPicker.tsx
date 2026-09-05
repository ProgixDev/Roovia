import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";

interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarPicker({ value, onChange }: StarPickerProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      {Array.from({ length: 5 }, (_, i) => (
        <Pressable key={i} onPress={() => onChange(i + 1)} hitSlop={6}>
          <Ionicons name={i < value ? "star" : "star-outline"} size={26} color={theme.colors.amber} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
});
