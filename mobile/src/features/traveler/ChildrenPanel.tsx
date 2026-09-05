import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { ChildProfile } from "../../store/travelerProfileStore";

interface ChildrenPanelProps {
  kids: ChildProfile[];
  onChange: (kids: ChildProfile[]) => void;
}

/**
 * Only rendered when `party === "family"` (see `who.tsx`). No name field,
 * and no per-child list — just a count. The +/- pill adds/removes a
 * default-age-8 child; nothing surfaces individual children or their ages
 * on this screen (a prior per-child chip list was cut per the user's own
 * ask, not just the name field this component already lacked).
 */
export function ChildrenPanel({ kids, onChange }: ChildrenPanelProps) {
  const { theme } = useTheme();

  const setCount = (count: number) => {
    if (count > kids.length) {
      onChange([...kids, { id: `child_${Date.now()}`, age: 8 }]);
    } else if (count < kids.length) {
      onChange(kids.slice(0, -1));
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <Text style={[typography.button, { color: theme.colors.ink }]}>Voyagez-vous avec des enfants ?</Text>

      <View style={[styles.pill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
        <Pressable
          onPress={() => setCount(Math.max(0, kids.length - 1))}
          disabled={kids.length === 0}
          hitSlop={10}
          style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceSunken, opacity: kids.length === 0 ? 0.4 : 1 }]}
        >
          <Ionicons name="remove" size={20} color={theme.colors.ink} />
        </Pressable>
        <Text style={[typography.button, { color: theme.colors.ink }]}>
          {kids.length} enfant{kids.length > 1 ? "s" : ""}
        </Text>
        <Pressable
          onPress={() => setCount(Math.min(8, kids.length + 1))}
          hitSlop={10}
          style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceSunken }]}
        >
          <Ionicons name="add" size={20} color={theme.colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: 16, gap: 18 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 54,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  stepBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
