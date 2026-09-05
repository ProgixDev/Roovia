import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { CountryRules } from "../../mocks/countryRules";

const LEGAL_COLOR: Record<CountryRules["wildCampingLegal"], "moss" | "amber" | "danger"> = {
  autorisé: "moss",
  toléré: "amber",
  interdit: "danger",
};

export function CountryRulesCard({ rules }: { rules: CountryRules }) {
  const { theme } = useTheme();
  const legalColor = theme.colors[LEGAL_COLOR[rules.wildCampingLegal]];

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Réglementation — {rules.country}</Text>

      <View style={styles.row}>
        <Ionicons name="bonfire-outline" size={16} color={legalColor} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.button, { color: theme.colors.ink, fontSize: 13 }]}>
            Bivouac : <Text style={{ color: legalColor }}>{rules.wildCampingLegal}</Text>
          </Text>
          <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 12, marginTop: 2 }]}>{rules.wildCampingNote}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Ionicons name="cash-outline" size={16} color={theme.colors.inkMuted} />
        <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 12, flex: 1 }]}>{rules.tollsNote}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name={rules.lezZones ? "alert-circle-outline" : "checkmark-circle-outline"} size={16} color={theme.colors.inkMuted} />
        <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 12, flex: 1 }]}>{rules.lezNote}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: 1, padding: 14, gap: 10 },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
});
