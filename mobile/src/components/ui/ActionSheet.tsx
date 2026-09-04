import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

export interface ActionSheetAction {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionSheetAction[];
}

/**
 * A bottom sheet action menu — `radius.xl`, DESIGN.md's "bottom sheets,
 * modals" token, its first real use. Built rather than reaching for
 * `Alert.alert`: Android's native alert only renders ~3 buttons well, and
 * trip cards need four (dupliquer/archiver/supprimer/partager) plus cancel.
 */
export function ActionSheet({ visible, onClose, title, actions }: ActionSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const runAction = (action: ActionSheetAction) => {
    onClose();
    action.onPress();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View
        style={[
          styles.sheet,
          { backgroundColor: theme.colors.surfaceRaised, paddingBottom: insets.bottom + 12 },
        ]}
      >
        {title ? (
          <Text style={[typography.caption, styles.title, { color: theme.colors.inkMuted }]}>
            {title}
          </Text>
        ) : null}

        {actions.map((action) => (
          <Pressable
            key={action.key}
            onPress={() => runAction(action)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
          >
            <Ionicons
              name={action.icon}
              size={20}
              color={action.destructive ? theme.colors.danger : theme.colors.ink}
            />
            <Text
              style={[
                typography.body,
                { color: action.destructive ? theme.colors.danger : theme.colors.ink },
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.row, styles.cancel, pressed && { opacity: 0.6 }]}
        >
          <Text style={[typography.button, { color: theme.colors.inkMuted }]}>Annuler</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  title: { paddingHorizontal: 12, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 12, height: 50 },
  cancel: { justifyContent: "center", marginTop: 4 },
});
