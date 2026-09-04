import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Stepper } from "../../components/ui/Stepper";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { ChildProfile } from "../../store/travelerProfileStore";

interface ChildAgeRowProps {
  child: ChildProfile;
  index: number;
  onChangeAge: (age: number) => void;
  onRemove: () => void;
}

export function ChildAgeRow({ child, index, onChangeAge, onRemove }: ChildAgeRowProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.row, { borderColor: theme.colors.line, backgroundColor: theme.colors.surface }]}>
      <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>Enfant {index + 1}</Text>
      <Stepper value={child.age} min={0} max={17} onChange={onChangeAge} />
      <Pressable onPress={onRemove} hitSlop={10} style={styles.remove}>
        <Ionicons name="close" size={18} color={theme.colors.inkMuted} />
      </Pressable>
    </View>
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
  remove: { marginLeft: 4 },
});
