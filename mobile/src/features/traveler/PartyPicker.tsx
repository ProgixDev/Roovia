import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { PartyComposition } from "../../store/travelerProfileStore";

const OPTIONS: { value: PartyComposition; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "solo", label: "Solo", icon: "person-outline" },
  { value: "couple", label: "En couple", icon: "heart-outline" },
  { value: "family", label: "En famille", icon: "people-outline" },
  { value: "friends", label: "Entre amis", icon: "people-circle-outline" },
];

interface PartyPickerProps {
  value: PartyComposition | null;
  onChange: (value: PartyComposition) => void;
}

/** A 2×2 grid of cards, not plain chips — this is the wizard's first, tone-setting question. */
export function PartyPicker({ value, onChange }: PartyPickerProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.grid}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: selected ? theme.colors.blaze : theme.colors.surface,
                borderColor: selected ? theme.colors.blaze : theme.colors.line,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Ionicons
              name={option.icon}
              size={28}
              color={selected ? theme.colors.blazeInk : theme.colors.ink}
            />
            <Text
              style={[
                typography.button,
                { color: selected ? theme.colors.blazeInk : theme.colors.ink, marginTop: 10 },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "47%",
    aspectRatio: 1.3,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
