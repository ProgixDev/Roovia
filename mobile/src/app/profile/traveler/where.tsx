import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { DateField } from "../../../components/ui/DateField";
import { FieldGroup } from "../../../components/ui/FieldGroup";
import { radius } from "../../../constants/themes";
import { typography } from "../../../constants/typography";
import { useTheme } from "../../../contexts/ThemeContext";
import { DestinationAutocomplete } from "../../../features/traveler/DestinationAutocomplete";
import { DestinationSearchField } from "../../../features/traveler/DestinationSearchField";
import { PhaseWizardShell } from "../../../features/wizard/PhaseWizardShell";
import { formatDate, formatDateRange, formatMonthYear } from "../../../lib/format";
import { type DatedConstraint, useTravelerProfileStore } from "../../../store/travelerProfileStore";

/** "YYYY-MM-DD", parsed as local midnight — appending a bare date to `Date`
 * would parse as UTC midnight, which reads back as the previous day in any
 * timezone west of UTC. Every date this screen stores goes through these
 * two so a round trip never drifts by a day. */
function parseISODate(value: string): Date | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00`);
}
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const TRAVELER_STEPS = ["Qui", "Où", "Style", "Bilan"];

/** Phase 2/4 — destination, dates, and fixed stops (moved here from the old "preferences" step — a stop is where-shaped, not style-shaped). */
export default function TravelerWhereStep() {
  const router = useRouter();
  const { theme } = useTheme();
  const profile = useTravelerProfileStore((s) => s.profile);
  const update = useTravelerProfileStore((s) => s.update);

  const [destination, setDestination] = useState(profile.destination);
  const [datesFixed, setDatesFixed] = useState(profile.datesFixed);
  const [startDate, setStartDate] = useState(profile.startDate);
  const [endDate, setEndDate] = useState(profile.endDate);
  const [flexibleMonth, setFlexibleMonth] = useState(profile.flexibleMonth);
  const [constraints, setConstraints] = useState<DatedConstraint[]>(profile.constraints);
  const [addingStop, setAddingStop] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDate, setNewDate] = useState("");

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/profile/traveler/who" as any);
  };

  const confirmStop = () => {
    if (!newLabel.trim() || !newDate.trim()) return;
    setConstraints((prev) => [...prev, { id: `constraint_${Date.now()}`, label: newLabel.trim(), date: newDate.trim() }]);
    setNewLabel("");
    setNewDate("");
    setAddingStop(false);
  };

  const removeStop = (id: string) => setConstraints((prev) => prev.filter((c) => c.id !== id));

  const next = async () => {
    await update({ destination, datesFixed, startDate, endDate, flexibleMonth, constraints });
    router.push("/profile/traveler/style" as any);
  };

  const dateSummary = datesFixed
    ? startDate && endDate
      ? formatDateRange(parseISODate(startDate)!, parseISODate(endDate)!)
      : "Choisissez vos dates"
    : flexibleMonth
      ? formatMonthYear(parseISODate(flexibleMonth)!)
      : "Mois flexible";

  return (
    <PhaseWizardShell
      step={1}
      stepLabels={TRAVELER_STEPS}
      headerTitle="Profil voyageur"
      exitRoute="/(tabs)/profil"
      title="Où et quand ?"
      subtitle="Une destination précise ou une simple envie — les deux fonctionnent."
      onBack={goBack}
      footer={<Button label="Continuer" onPress={next} />}
    >
      <FieldGroup label="Destination">
        <DestinationSearchField value={destination} onChange={setDestination} />
      </FieldGroup>

      <FieldGroup label="Dates du voyage">
        <View style={[styles.datesCard, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.line }]}>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.ink} />
          <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]} numberOfLines={1}>
            {dateSummary}
          </Text>
          <Pressable
            onPress={() => setDatesFixed((v) => !v)}
            style={[styles.toggle, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}
          >
            <Ionicons name="calendar-outline" size={14} color={theme.colors.ink} />
            <Text style={[typography.button, { color: theme.colors.ink, fontSize: 13 }]}>
              {datesFixed ? "Dates flexibles" : "Dates fixes"}
            </Text>
          </Pressable>
        </View>

        {datesFixed ? (
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <DateField
                label="Date de début"
                date={parseISODate(startDate)}
                onChange={(d) => setStartDate(toISODate(d))}
                formatDisplay={formatDate}
                placeholder="Choisir une date"
              />
            </View>
            <View style={{ flex: 1 }}>
              <DateField
                label="Date de fin"
                date={parseISODate(endDate)}
                onChange={(d) => setEndDate(toISODate(d))}
                formatDisplay={formatDate}
                placeholder="Choisir une date"
              />
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 12 }}>
            <DateField
              label="Mois souhaité"
              date={parseISODate(flexibleMonth)}
              onChange={(d) => setFlexibleMonth(toISODate(d))}
              formatDisplay={formatMonthYear}
              placeholder="Choisir un mois"
            />
          </View>
        )}
      </FieldGroup>

      <FieldGroup label="Une étape incontournable ?">
        <View style={styles.stops}>
          {constraints.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => removeStop(c.id)}
              style={[styles.stopChip, { backgroundColor: `${theme.colors.blaze}1F`, borderColor: theme.colors.blaze }]}
            >
              <View style={[styles.stopCheck, { backgroundColor: theme.colors.blaze }]}>
                <Ionicons name="checkmark" size={12} color={theme.colors.blazeInk} />
              </View>
              <Text style={[typography.button, { color: theme.colors.blaze, fontSize: 14 }]}>
                {c.label} · {formatDate(parseISODate(c.date)!)}
              </Text>
            </Pressable>
          ))}

          {!addingStop ? (
            <Pressable
              onPress={() => setAddingStop(true)}
              style={[styles.addStop, { borderColor: theme.colors.ink }]}
            >
              <Ionicons name="add" size={16} color={theme.colors.ink} />
              <Text style={[typography.button, { color: theme.colors.ink, fontSize: 14 }]}>Ajouter une étape</Text>
            </Pressable>
          ) : null}
        </View>

        {addingStop ? (
          <View style={{ gap: 10, marginTop: 12 }}>
            <DestinationAutocomplete
              label="Étape"
              placeholder="Ville ou lieu à ne pas manquer"
              value={newLabel}
              onChange={setNewLabel}
            />
            <DateField
              label="Date"
              date={parseISODate(newDate)}
              onChange={(d) => setNewDate(toISODate(d))}
              formatDisplay={formatDate}
              placeholder="Choisir une date"
            />
            <Button label="Confirmer l'étape" variant="secondary" icon="checkmark" onPress={confirmStop} />
          </View>
        ) : null}
      </FieldGroup>
    </PhaseWizardShell>
  );
}

const styles = StyleSheet.create({
  datesCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  stops: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stopChip: { flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1.5 },
  stopCheck: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  addStop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
});
