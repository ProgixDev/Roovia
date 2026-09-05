import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface IconToggleCardProps {
  icon: ReactNode;
  label: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * A square icon+label card that toggles on tap — tint background, border,
 * and a checkmark badge when selected, unselected icon/label colors
 * unchanged. Same visual language as `traveler/PartyPicker`'s cards
 * (generalized here since the vehicle wizard's Comfort and Water & Tanks
 * sections both need it — `PartyPicker` itself is left as its own copy
 * rather than retrofitted onto this, to avoid churning already-shipped
 * code for a pattern that only became a 3rd/4th use just now).
 */
export function IconToggleCard({ icon, label, selected, onPress }: IconToggleCardProps) {
  const { theme } = useTheme();
  const tint = `${theme.colors.blaze}1F`;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: selected ? tint : theme.colors.surface,
          borderColor: selected ? theme.colors.blaze : theme.colors.line,
        },
      ]}
    >
      {selected ? (
        <View style={[styles.badge, { backgroundColor: theme.colors.blaze }]}>
          <Ionicons name="checkmark" size={12} color={theme.colors.blazeInk} />
        </View>
      ) : null}
      <View style={styles.content}>
        {icon}
        <Text style={[typography.button, { color: theme.colors.ink, marginTop: 8, fontSize: 13, textAlign: "center" }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: "22%",
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});
