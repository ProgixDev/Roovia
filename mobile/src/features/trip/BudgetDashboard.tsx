import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { computeBudget, partySizeFrom, perDayEstimate } from "../../lib/budget";
import { formatEurAs } from "../../lib/format";
import type { TripDay } from "../../mocks/itineraries";
import { useSettingsStore, type Currency } from "../../store/settingsStore";
import { useTravelerProfileStore } from "../../store/travelerProfileStore";
import type { Vehicle } from "../../store/vehiclesStore";

const CURRENCIES: Currency[] = ["EUR", "USD", "GBP", "CHF"];

interface BudgetDashboardProps {
  days: TripDay[];
  totalDistanceKm: number;
  activeVehicle: Vehicle | null;
  onMakeItCheaper: () => void;
}

export function BudgetDashboard({ days, totalDistanceKm, activeVehicle, onMakeItCheaper }: BudgetDashboardProps) {
  const { theme } = useTheme();
  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const profile = useTravelerProfileStore((s) => s.profile);

  const partySize = partySizeFrom(profile.party, profile.children.length);
  const breakdown = computeBudget(days, activeVehicle, totalDistanceKm, partySize);
  const overBudget = profile.budgetEur > 0 && breakdown.totalEur > profile.budgetEur;

  const rows = [
    { label: "Carburant", value: breakdown.fuelEur, color: theme.colors.lake },
    { label: "Hébergement", value: breakdown.campingEur, color: theme.colors.contour },
    { label: "Activités", value: breakdown.activitiesEur, color: theme.colors.moss },
    { label: "Nourriture", value: breakdown.foodEur, color: theme.colors.amber },
    { label: "Péages", value: breakdown.tollsEur, color: theme.colors.danger },
  ].filter((r) => r.value > 0);

  const dayEstimates = days.map((day) => ({ day, value: perDayEstimate(day, days, breakdown) }));
  const maxDay = Math.max(1, ...dayEstimates.map((d) => d.value));

  return (
    <View style={{ gap: 20 }}>
      <FieldGroup label="Devise">
        <View style={{ flexDirection: "row", gap: 8 }}>
          {CURRENCIES.map((c) => (
            <Chip key={c} label={c} selected={currency === c} onPress={() => setCurrency(c)} />
          ))}
        </View>
      </FieldGroup>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
        <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Estimé pour ce voyage</Text>
        <Text style={[typography.heroStat, { color: theme.colors.ink, marginTop: 6 }]}>
          {formatEurAs(breakdown.totalEur, currency)}
        </Text>
        {breakdown.perPersonEur !== null ? (
          <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 4 }]}>
            Soit {formatEurAs(breakdown.perPersonEur, currency)} par personne ({partySize} voyageurs)
          </Text>
        ) : null}

        {profile.budgetEur > 0 ? (
          <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 4 }]}>
            Budget prévu dans votre profil : {formatEurAs(profile.budgetEur, currency)}
          </Text>
        ) : null}

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
              <Text style={[typography.mono, { color: theme.colors.ink, fontSize: 13 }]}>{formatEurAs(row.value, currency)}</Text>
            </View>
          ))}
        </View>
      </View>

      {overBudget ? (
        <View style={[styles.warning, { backgroundColor: theme.colors.surface, borderColor: theme.colors.danger }]}>
          <Ionicons name="warning-outline" size={18} color={theme.colors.danger} />
          <Text style={[typography.body, { color: theme.colors.danger, flex: 1, fontSize: 13 }]}>
            Ce voyage dépasse le budget prévu.
          </Text>
        </View>
      ) : null}
      {overBudget ? <Button label="Rendre ce voyage moins cher" variant="secondary" icon="cash-outline" onPress={onMakeItCheaper} /> : null}

      <FieldGroup label="Dépense estimée par jour">
        <View style={styles.dayChart}>
          {dayEstimates.map(({ day, value }) => (
            <View key={day.id} style={styles.dayColumn}>
              <View style={[styles.dayBar, { height: 8 + (value / maxDay) * 80, backgroundColor: theme.colors.blaze }]} />
              <Text style={[typography.caption, { color: theme.colors.inkMuted, marginTop: 6 }]}>J{day.index}</Text>
            </View>
          ))}
        </View>
      </FieldGroup>

      <View style={[styles.actualCard, { backgroundColor: theme.colors.surfaceSunken }]}>
        <Text style={[typography.button, { color: theme.colors.ink }]}>Dépenses réelles</Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 4, fontSize: 13 }]}>
          {"Aucune dépense enregistrée pour l'instant — ajoutez-en depuis l'onglet Dépenses."}
        </Text>
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
  warning: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: radius.md, borderWidth: 1 },
  dayChart: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingTop: 10 },
  dayColumn: { alignItems: "center" },
  dayBar: { width: 20, borderRadius: 6 },
  actualCard: { borderRadius: radius.lg, padding: 16 },
});
