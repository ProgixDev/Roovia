import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface IncompatibilityBannerProps {
  stopName: string;
  issues: string[];
}

/** Renders only when `lib/vehicleFit.fitIssues` actually finds something — the caller owns that check. */
export function IncompatibilityBanner({ stopName, issues }: IncompatibilityBannerProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.banner, { backgroundColor: theme.colors.surface, borderColor: theme.colors.danger }]}>
      <Ionicons name="warning-outline" size={18} color={theme.colors.danger} />
      <View style={{ flex: 1 }}>
        <Text style={[typography.button, { color: theme.colors.danger, fontSize: 13 }]}>
          {stopName} — véhicule incompatible
        </Text>
        {issues.map((issue) => (
          <Text key={issue} style={[typography.body, { color: theme.colors.inkMuted, fontSize: 12, marginTop: 2 }]}>
            {issue}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "flex-start",
  },
});
