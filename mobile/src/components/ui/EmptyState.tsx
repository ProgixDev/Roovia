import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { Button, type ButtonProps } from "./Button";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void; icon?: ButtonProps["icon"] };
}

/** The one empty-state layout for every list and not-yet-built screen in the app. */
export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceSunken }]}>
        <Ionicons name={icon} size={28} color={theme.colors.inkMuted} />
      </View>
      <Text style={[typography.cardTitle, { color: theme.colors.ink, textAlign: "center", marginTop: 16 }]}>
        {title}
      </Text>
      {body ? (
        <Text
          style={[typography.body, { color: theme.colors.inkMuted, textAlign: "center", marginTop: 6 }]}
        >
          {body}
        </Text>
      ) : null}
      {action ? (
        <View style={{ marginTop: 20, alignSelf: "stretch" }}>
          <Button label={action.label} icon={action.icon} onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
});
