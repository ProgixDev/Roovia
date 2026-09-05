import { StyleSheet, Text, View } from "react-native";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { SuggestionDiff } from "../../mocks/suggestions";

interface DiffPreviewProps {
  diff: SuggestionDiff;
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/** ±km / ±€ / ±min, and the specific stops the change adds or removes — DESIGN.md-consistent moss (better) / amber (costs more) for the deltas, moss/danger for the stop list itself. */
export function DiffPreview({ diff }: DiffPreviewProps) {
  const { theme } = useTheme();
  const deltaColor = (n: number) => (n < 0 ? theme.colors.moss : n > 0 ? theme.colors.amber : theme.colors.inkMuted);

  return (
    <View style={styles.wrap}>
      <View style={styles.numbers}>
        <Text style={[typography.mono, { color: deltaColor(diff.deltaKm), fontSize: 13 }]}>{signed(diff.deltaKm)} km</Text>
        <Text style={[typography.mono, { color: deltaColor(diff.deltaEur), fontSize: 13 }]}>{signed(diff.deltaEur)} €</Text>
        <Text style={[typography.mono, { color: deltaColor(diff.deltaMinutes), fontSize: 13 }]}>{signed(diff.deltaMinutes)} min</Text>
      </View>

      {diff.removedStopNames.map((name) => (
        <Text key={name} style={[typography.body, { color: theme.colors.danger, fontSize: 12, textDecorationLine: "line-through" }]}>
          {name}
        </Text>
      ))}
      {diff.addedStopNames.map((name) => (
        <Text key={name} style={[typography.body, { color: theme.colors.moss, fontSize: 12 }]}>
          + {name}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  numbers: { flexDirection: "row", gap: 14 },
});
