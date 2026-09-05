import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { EmptyState } from "../../components/ui/EmptyState";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { TextField } from "../../components/ui/TextField";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { emptyArray } from "../../lib/emptyArray";
import { formatEurAs } from "../../lib/format";
import { computeBalances, minimalSettlement, type Expense } from "../../lib/settle";
import { useExpensesStore } from "../../store/expensesStore";
import { useSettingsStore } from "../../store/settingsStore";
import { AddExpenseSheet } from "./AddExpenseSheet";
import { CATEGORY_LABEL } from "./expenseCategory";
import { ExpenseRow } from "./ExpenseRow";

interface ExpensesSegmentProps {
  tripId: string;
  tripTitle: string;
  meName: string;
}

export function ExpensesSegment({ tripId, tripTitle, meName }: ExpensesSegmentProps) {
  const { theme } = useTheme();
  const currency = useSettingsStore((s) => s.currency);

  const participants = useExpensesStore((s) => s.participantsByTrip[tripId] ?? emptyArray());
  const expenses = useExpensesStore((s) => s.expensesByTrip[tripId] ?? emptyArray());
  const offline = useExpensesStore((s) => s.offline);
  const ensureParticipants = useExpensesStore((s) => s.ensureParticipants);
  const addParticipant = useExpensesStore((s) => s.addParticipant);
  const addExpense = useExpensesStore((s) => s.addExpense);
  const removeExpense = useExpensesStore((s) => s.removeExpense);
  const toggleOffline = useExpensesStore((s) => s.toggleOffline);
  const syncPending = useExpensesStore((s) => s.syncPending);

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Expense["category"] | null>(null);

  useEffect(() => {
    if (participants.length === 0) ensureParticipants(tripId, meName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const pendingCount = expenses.filter((e) => !e.synced).length;
  const visibleExpenses = categoryFilter ? expenses.filter((e) => e.category === categoryFilter) : expenses;
  const nameFor = (id: string) => participants.find((p) => p.id === id)?.name ?? "?";

  const balances = computeBalances(expenses, participants.map((p) => p.id));
  const settlements = minimalSettlement(balances);
  const total = expenses.reduce((sum, e) => sum + e.amountEur, 0);

  const invite = () => {
    const code = tripId.slice(-6).toUpperCase();
    Share.share({ message: `Rejoins « ${tripTitle} » sur Roovia — code d'invitation : ${code}\nhttps://roovia.app/join/${code}` }).catch(() => {});
  };

  const exportSummary = () => {
    const lines = [
      `Récapitulatif — ${tripTitle}`,
      `Total : ${formatEurAs(total, currency)}`,
      ...settlements.map((s) => `${nameFor(s.from)} doit ${formatEurAs(s.amountEur, currency)} à ${nameFor(s.to)}`),
    ];
    Share.share({ message: lines.join("\n") }).catch(() => {});
  };

  return (
    <View style={{ gap: 20 }}>
      <View style={styles.headerRow}>
        <FieldGroup label="Participants">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {participants.map((p) => (
              <Chip key={p.id} label={p.name} />
            ))}
          </View>
        </FieldGroup>
        <Pressable onPress={invite} style={[styles.inviteButton, { borderColor: theme.colors.line }]}>
          <Ionicons name="share-outline" size={16} color={theme.colors.ink} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 2 }}>
          <TextField label="Ajouter un participant" value={newName} onChangeText={setNewName} placeholder="Prénom" />
        </View>
        <View style={{ justifyContent: "flex-end" }}>
          <Button
            label="Ajouter"
            variant="secondary"
            onPress={() => { if (newName.trim()) { addParticipant(tripId, newName.trim()); setNewName(""); } }}
          />
        </View>
      </View>

      <View style={[styles.offlineRow, { backgroundColor: theme.colors.surfaceSunken }]}>
        <Ionicons name={offline ? "cloud-offline-outline" : "cloud-done-outline"} size={16} color={theme.colors.inkMuted} />
        <Text style={[typography.body, { color: theme.colors.inkMuted, flex: 1, fontSize: 13 }]}>
          {offline ? `Mode hors ligne — ${pendingCount} dépense(s) en attente` : "Connecté"}
        </Text>
        <Pressable onPress={() => { toggleOffline(); if (offline) syncPending(tripId); }}>
          <Text style={[typography.button, { color: theme.colors.blaze, fontSize: 13 }]}>{offline ? "Reconnecter" : "Passer hors ligne"}</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
        <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Total des dépenses</Text>
        <Text style={[typography.heroStat, { color: theme.colors.ink, marginTop: 6 }]}>{formatEurAs(total, currency)}</Text>
      </View>

      {settlements.length > 0 ? (
        <FieldGroup label="Qui doit quoi">
          <View style={{ gap: 8 }}>
            {settlements.map((s, i) => (
              <View key={i} style={[styles.settleRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
                <Text style={[typography.body, { color: theme.colors.ink, flex: 1 }]}>
                  {nameFor(s.from)} doit à {nameFor(s.to)}
                </Text>
                <Text style={[typography.mono, { color: theme.colors.moss }]}>{formatEurAs(s.amountEur, currency)}</Text>
              </View>
            ))}
          </View>
        </FieldGroup>
      ) : null}

      <FieldGroup label="Dépenses">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
          <Chip label="Tout" selected={categoryFilter === null} onPress={() => setCategoryFilter(null)} />
          {(Object.keys(CATEGORY_LABEL) as Expense["category"][]).map((c) => (
            <Chip key={c} label={CATEGORY_LABEL[c]} selected={categoryFilter === c} onPress={() => setCategoryFilter(c)} />
          ))}
        </View>

        {visibleExpenses.length === 0 ? (
          <EmptyState icon="receipt-outline" title="Aucune dépense" body="Ajoutez la première dépense de ce voyage." />
        ) : (
          visibleExpenses.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} payerName={nameFor(expense.payerId)} currency={currency} onRemove={() => removeExpense(tripId, expense.id)} />
          ))
        )}
      </FieldGroup>

      <Button label="Ajouter une dépense" icon="add" onPress={() => setAddOpen(true)} />
      {expenses.length > 0 ? <Button label="Exporter le récapitulatif" variant="secondary" icon="download-outline" onPress={exportSummary} /> : null}

      <AddExpenseSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        participants={participants}
        offline={offline}
        onSubmit={(expense) => addExpense(tripId, expense)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  inviteButton: { width: 44, height: 44, borderRadius: radius.pill, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  offlineRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.md },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: 16 },
  settleRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: radius.md, borderWidth: 1 },
});
