import { StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { TripDay } from "../../mocks/itineraries";

interface BudgetSummaryProps {
  days: TripDay[];
  totalBudgetEur: number;
}

/** Derived from the itinerary's own stop prices, not invented — the one honest breakdown a mock itinerary can support. */
export function BudgetSummary({ days, totalBudgetEur }: BudgetSummaryProps) {
  const { theme } = useTheme();
  const stops = days.flatMap((d) => d.stops);

  const hebergement = stops.filter((s) => s.kind === "sleep_paid").reduce((sum, s) => sum + (s.priceEur ?? 0), 0);
  const activites = stops
    .filter((s) => s.kind === "activity" || s.kind === "visit")
    .reduce((sum, s) => sum + (s.priceEur ?? 0), 0);
  const reste = Math.max(0, totalBudgetEur - hebergement - activites);

  const rows = [
    { label: "Hébergement", value: hebergement, color: theme.colors.contour },
    { label: "Activités", value: activites, color: theme.colors.moss },
    { label: "Carburant & repas (estimé)", value: reste, color: theme.colors.lake },
  ].filter((r) => r.value > 0);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Budget estimé</Text>
      <Text style={[typography.heroStat, { color: theme.colors.ink, marginTop: 6 }]}>{totalBudgetEur} €</Text>

      <View style={styles.bar}>
        {rows.map((row) => (
          <View key={row.label} style={{ flex: row.value, backgroundColor: row.color }} />
        ))}
      </View>

      <View style={styles.legend}>
        {rows.map((row) => (
          <View key={row.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: row.color }]} />
            <Text style={[typography.body, { color: theme.colors.inkMuted, flex: 1 }]}>{row.label}</Text>
            <Text style={[typography.mono, { color: theme.colors.ink, fontSize: 13 }]}>{row.value} €</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: 16 },
  bar: { flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 16 },
  legend: { gap: 8, marginTop: 12 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
