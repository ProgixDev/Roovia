import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { ChecklistItem } from "../../store/checklistStore";
import type { Participant } from "../../store/expensesStore";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  participants: Participant[];
  onToggle: () => void;
  onAssign: (participantId: string | null) => void;
  onRemove: () => void;
}

export function ChecklistItemRow({ item, participants, onToggle, onAssign, onRemove }: ChecklistItemRowProps) {
  const { theme } = useTheme();
  const assignee = participants.find((p) => p.id === item.assigneeId) ?? null;

  const cycleAssignee = () => {
    if (participants.length === 0) return;
    const index = assignee ? participants.findIndex((p) => p.id === assignee.id) : -1;
    const next = participants[(index + 1) % participants.length];
    onAssign(next.id);
  };

  return (
    <View style={styles.row}>
      <Pressable onPress={onToggle} hitSlop={8}>
        <Ionicons name={item.done ? "checkbox" : "square-outline"} size={22} color={item.done ? theme.colors.blaze : theme.colors.inkMuted} />
      </Pressable>

      <Text
        style={[
          typography.body,
          { color: item.done ? theme.colors.inkMuted : theme.colors.ink, flex: 1, textDecorationLine: item.done ? "line-through" : "none" },
        ]}
      >
        {item.label}
      </Text>

      <Pressable onPress={cycleAssignee} style={[styles.assignee, { borderColor: theme.colors.line }]}>
        <Text style={[typography.caption, { color: theme.colors.inkMuted, fontSize: 10, textTransform: "none", letterSpacing: 0 }]} numberOfLines={1}>
          {assignee?.name ?? "—"}
        </Text>
      </Pressable>

      {item.custom ? (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close" size={16} color={theme.colors.inkMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, height: 44 },
  assignee: { minWidth: 60, height: 26, paddingHorizontal: 8, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
