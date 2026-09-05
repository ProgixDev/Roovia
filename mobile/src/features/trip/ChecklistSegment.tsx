import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Switch } from "../../components/ui/Switch";
import { TextField } from "../../components/ui/TextField";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { CATEGORY_LABEL, generateChecklist, type ChecklistCategory } from "../../lib/checklistRules";
import { useChecklistStore } from "../../store/checklistStore";
import { useExpensesStore } from "../../store/expensesStore";
import { useTravelerProfileStore } from "../../store/travelerProfileStore";
import { useVehiclesStore } from "../../store/vehiclesStore";
import { ChecklistItemRow } from "./ChecklistItemRow";

const CATEGORIES = Object.keys(CATEGORY_LABEL) as ChecklistCategory[];

interface ChecklistSegmentProps {
  tripId: string;
  destination: string;
  /** From the active itinerary version when one exists — falls back to the traveler profile's planned duration otherwise, so the checklist doesn't need a generated itinerary to exist. */
  nightsFromItinerary?: number;
}

export function ChecklistSegment({ tripId, destination, nightsFromItinerary }: ChecklistSegmentProps) {
  const { theme } = useTheme();
  const profile = useTravelerProfileStore((s) => s.profile);
  const activeVehicle = useVehiclesStore((s) => s.vehicles.find((v) => v.id === s.activeId)) ?? null;
  const participants = useExpensesStore((s) => s.participantsByTrip[tripId] ?? []);
  const nights = nightsFromItinerary ?? profile.nights;

  const items = useChecklistStore((s) => s.itemsByTrip[tripId] ?? []);
  const reminders = useChecklistStore((s) => s.remindersByTrip[tripId]) ?? { d7: true, d1: true };
  const template = useChecklistStore((s) => s.template);
  const ensureGenerated = useChecklistStore((s) => s.ensureGenerated);
  const toggleItem = useChecklistStore((s) => s.toggleItem);
  const addCustomItem = useChecklistStore((s) => s.addCustomItem);
  const removeItem = useChecklistStore((s) => s.removeItem);
  const assignItem = useChecklistStore((s) => s.assignItem);
  const toggleReminder = useChecklistStore((s) => s.toggleReminder);
  const saveAsTemplate = useChecklistStore((s) => s.saveAsTemplate);
  const applyTemplate = useChecklistStore((s) => s.applyTemplate);

  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<ChecklistCategory>("bagages");

  if (items.length === 0) {
    ensureGenerated(
      tripId,
      generateChecklist({ destination, nights, party: profile.party, hasChildren: profile.children.length > 0, vehicle: activeVehicle }),
    );
  }

  const doneCount = items.filter((i) => i.done).length;
  const overallProgress = items.length > 0 ? doneCount / items.length : 0;

  return (
    <View style={{ gap: 20 }}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
        <View style={styles.summaryRow}>
          <Text style={[typography.button, { color: theme.colors.ink }]}>Progression</Text>
          <Text style={[typography.mono, { color: theme.colors.inkMuted, fontSize: 13 }]}>{doneCount}/{items.length}</Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <ProgressBar progress={overallProgress} />
        </View>
      </View>

      {CATEGORIES.map((category) => {
        const categoryItems = items.filter((i) => i.category === category);
        if (categoryItems.length === 0) return null;
        const done = categoryItems.filter((i) => i.done).length;

        return (
          <View key={category} style={{ gap: 10 }}>
            <View style={styles.categoryHeader}>
              <Text style={[typography.cardTitle, { color: theme.colors.ink }]}>{CATEGORY_LABEL[category]}</Text>
              <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{done}/{categoryItems.length}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
              {categoryItems.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  participants={participants}
                  onToggle={() => toggleItem(tripId, item.id)}
                  onAssign={(participantId) => assignItem(tripId, item.id, participantId)}
                  onRemove={() => removeItem(tripId, item.id)}
                />
              ))}
            </View>
          </View>
        );
      })}

      <FieldGroup label="Ajouter un élément">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={CATEGORY_LABEL[c]} selected={newCategory === c} onPress={() => setNewCategory(c)} />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <TextField label="Élément" value={newLabel} onChangeText={setNewLabel} placeholder="Ex : Réservation ferry" />
          </View>
        </View>
        <Button
          label="Ajouter"
          variant="secondary"
          icon="add"
          onPress={() => { if (newLabel.trim()) { addCustomItem(tripId, newLabel.trim(), newCategory); setNewLabel(""); } }}
        />
      </FieldGroup>

      <FieldGroup label="Rappels">
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          <View style={styles.reminderRow}>
            <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>7 jours avant le départ</Text>
            <Switch value={reminders.d7} onChange={() => toggleReminder(tripId, "d7")} />
          </View>
          <View style={[styles.reminderDivider, { backgroundColor: theme.colors.line }]} />
          <View style={styles.reminderRow}>
            <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]}>1 jour avant le départ</Text>
            <Switch value={reminders.d1} onChange={() => toggleReminder(tripId, "d1")} />
          </View>
        </View>
      </FieldGroup>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button label="Enregistrer comme modèle" variant="secondary" onPress={() => saveAsTemplate(tripId)} />
        </View>
        {template ? (
          <View style={{ flex: 1 }}>
            <Button label="Appliquer mon modèle" variant="secondary" onPress={() => applyTemplate(tripId)} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: 14 },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  categoryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reminderRow: { flexDirection: "row", alignItems: "center", height: 44 },
  reminderDivider: { height: StyleSheet.hairlineWidth },
});
