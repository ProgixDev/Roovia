import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { TextField } from "../../components/ui/TextField";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Expense, SplitType } from "../../lib/settle";
import type { Participant } from "../../store/expensesStore";
import { CATEGORY_ICON, CATEGORY_LABEL } from "./expenseCategory";

const CATEGORIES = Object.keys(CATEGORY_LABEL) as Expense["category"][];
const SPLIT_LABEL: Record<SplitType, string> = { equal: "Égal", shares: "Parts", exact: "Exact" };

interface AddExpenseSheetProps {
  visible: boolean;
  onClose: () => void;
  participants: Participant[];
  offline: boolean;
  onSubmit: (expense: Expense) => void;
}

export function AddExpenseSheet({ visible, onClose, participants, offline, onSubmit }: AddExpenseSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState(participants[0]?.id ?? "me");
  const [category, setCategory] = useState<Expense["category"]>("nourriture");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});
  const [hasReceipt, setHasReceipt] = useState(false);

  const reset = () => {
    setAmount("");
    setCategory("nourriture");
    setSplitType("equal");
    setSplitValues({});
    setHasReceipt(false);
  };

  const submit = () => {
    const amountEur = parseFloat(amount.replace(",", "."));
    if (Number.isNaN(amountEur) || amountEur <= 0) return;

    const expense: Expense = {
      id: `expense_${Date.now()}`,
      amountEur,
      payerId,
      category,
      splitType,
      participantIds: participants.map((p) => p.id),
      splits:
        splitType === "equal"
          ? undefined
          : participants.map((p) => ({ participantId: p.id, shareOrAmount: parseFloat(splitValues[p.id] ?? "0") || 0 })),
      date: new Date().toISOString().slice(0, 10),
      hasReceipt,
      synced: !offline,
    };
    onSubmit(expense);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised, paddingBottom: insets.bottom + 20 }]}>
        <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 22 }]}>Nouvelle dépense</Text>
        <ScrollView style={{ marginTop: 16 }} contentContainerStyle={{ gap: 20 }} keyboardShouldPersistTaps="handled">
          <TextField label="Montant (€)" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />

          <FieldGroup label="Payé par">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {participants.map((p) => (
                <Chip key={p.id} label={p.name} selected={payerId === p.id} onPress={() => setPayerId(p.id)} />
              ))}
            </View>
          </FieldGroup>

          <FieldGroup label="Catégorie">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map((c) => (
                <Chip key={c} label={CATEGORY_LABEL[c]} icon={CATEGORY_ICON[c]} selected={category === c} onPress={() => setCategory(c)} />
              ))}
            </View>
          </FieldGroup>

          <FieldGroup label="Répartition">
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(Object.keys(SPLIT_LABEL) as SplitType[]).map((s) => (
                <Chip key={s} label={SPLIT_LABEL[s]} selected={splitType === s} onPress={() => setSplitType(s)} />
              ))}
            </View>

            {splitType !== "equal" ? (
              <View style={{ gap: 10, marginTop: 4 }}>
                {participants.map((p) => (
                  <View key={p.id} style={styles.splitRow}>
                    <Text style={[typography.body, { color: theme.colors.ink, flex: 1 }]}>{p.name}</Text>
                    <View style={{ width: 90 }}>
                      <TextField
                        label={splitType === "shares" ? "Parts" : "€"}
                        value={splitValues[p.id] ?? ""}
                        onChangeText={(v) => setSplitValues((prev) => ({ ...prev, [p.id]: v }))}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </FieldGroup>

          <Pressable onPress={() => setHasReceipt((v) => !v)} style={styles.receiptRow}>
            <Ionicons name={hasReceipt ? "checkbox" : "square-outline"} size={20} color={hasReceipt ? theme.colors.blaze : theme.colors.inkMuted} />
            <Text style={[typography.body, { color: theme.colors.ink }]}>Joindre un reçu (photo)</Text>
          </Pressable>

          <Button label="Ajouter" onPress={submit} disabled={!amount.trim()} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "88%", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20 },
  splitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  receiptRow: { flexDirection: "row", alignItems: "center", gap: 10 },
});
