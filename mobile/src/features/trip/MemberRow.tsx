import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { GroupMember, MemberRole } from "../../store/groupStore";

const ROLE_LABEL: Record<MemberRole, string> = { owner: "Propriétaire", editor: "Éditeur", viewer: "Lecteur" };
const ROLE_ORDER: MemberRole[] = ["viewer", "editor", "owner"];

interface MemberRowProps {
  member: GroupMember;
  canEdit: boolean;
  onChangeRole: (role: MemberRole) => void;
  onRemove: () => void;
}

export function MemberRow({ member, canEdit, onChangeRole, onRemove }: MemberRowProps) {
  const { theme } = useTheme();

  const cycleRole = () => {
    if (!canEdit || member.role === "owner") return;
    const next = ROLE_ORDER[(ROLE_ORDER.indexOf(member.role) + 1) % ROLE_ORDER.length];
    onChangeRole(next === "owner" ? "editor" : next);
  };

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceSunken }]}>
        <Text style={[typography.button, { color: theme.colors.ink, fontSize: 13 }]}>{member.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>{member.name}</Text>
      <Pressable onPress={cycleRole} style={[styles.roleChip, { borderColor: theme.colors.line }]} disabled={!canEdit || member.role === "owner"}>
        <Text style={[typography.caption, { color: theme.colors.inkMuted, textTransform: "none", letterSpacing: 0 }]}>{ROLE_LABEL[member.role]}</Text>
      </Pressable>
      {canEdit && member.role !== "owner" ? (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close" size={16} color={theme.colors.inkMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, height: 48 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  roleChip: { height: 28, paddingHorizontal: 10, borderRadius: radius.pill, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
