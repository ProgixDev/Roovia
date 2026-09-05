import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { PartyComposition } from "../../store/travelerProfileStore";

const OPTIONS: { value: PartyComposition; label: string; icon: string }[] = [
  { value: "solo", label: "Solo", icon: "person-outline" },
  { value: "couple", label: "En couple", icon: "human-male-female" },
  { value: "family", label: "En famille", icon: "human-male-female-child" },
  { value: "friends", label: "Entre amis", icon: "account-group-outline" },
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
        const tint = `${theme.colors.blaze}1F`;
        const Icon = option.icon === "person-outline" ? Ionicons : MaterialCommunityIcons;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: selected ? tint : theme.colors.surface,
                borderColor: selected ? theme.colors.blaze : theme.colors.line,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            {selected ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.blaze }]}>
                <Ionicons name="checkmark" size={14} color={theme.colors.blazeInk} />
              </View>
            ) : null}
            <View style={styles.content}>
              <View style={styles.iconBox}>
                <Icon
                  name={option.icon as never}
                  size={46}
                  color={selected ? theme.colors.blaze : theme.colors.ink}
                />
              </View>
              <Text
                style={[
                  typography.button,
                  { color: selected ? theme.colors.blaze : theme.colors.ink, marginTop: 10, textAlign: "center" },
                ]}
              >
                {option.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    flexGrow: 1,
    flexBasis: "45%",
    aspectRatio: 1.7,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconBox: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
